/**
 * VELLIA LICITAÇÕES — PROVEDOR DE IA GENERATIVA EM NUVEM (GEMINI & OPENAI)
 * Motor de Inteligência Artificial para Leitura Profunda de Editais, Matriz de Riscos e Copilot.
 * 
 * Modelos Suportados:
 * 1. Google Gemini (gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash)
 * 2. OpenAI (gpt-4o-mini, gpt-4o)
 * 3. Fallback Heurístico Local (quando sem chave de API ou offline)
 */

import { logService, LogType } from '../logService.js';

const STORAGE_KEY_AI_CONFIG = 'vellia_ai_provider_config_v1';

export const AI_PROVIDERS = {
  GEMINI: 'GEMINI',
  OPENAI: 'OPENAI',
  LOCAL_HEURISTIC: 'LOCAL_HEURISTIC'
};

const DEFAULT_CONFIG = {
  provider: AI_PROVIDERS.GEMINI,
  geminiModel: 'gemini-1.5-flash',
  openaiModel: 'gpt-4o-mini',
  geminiApiKey: '',
  openaiApiKey: '',
  temperature: 0.2, // Baixa temperatura para precisão em licitações
  maxTokens: 2500,
  enabled: true
};

export class AiModelProviderService {
  /**
   * Obtém as configurações salvas ou de variáveis de ambiente
   */
  static getConfig() {
    let config = { ...DEFAULT_CONFIG };
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY_AI_CONFIG);
        if (raw) config = { ...config, ...JSON.parse(raw) };
      }
    } catch {}

    // Fallback para variáveis de ambiente Vite caso existam
    if (!config.geminiApiKey && typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
      config.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    }
    if (!config.openaiApiKey && typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENAI_API_KEY) {
      config.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    }

    return config;
  }

  /**
   * Salva as configurações
   */
  static saveConfig(newConfig) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_AI_CONFIG, JSON.stringify(newConfig));
      }
    } catch (e) {
      console.warn('[AiService] Erro ao salvar config de IA:', e);
    }
    return newConfig;
  }

  /**
   * Verifica se há alguma chave de API de IA configurada
   */
  static isConfigured() {
    const config = this.getConfig();
    if (config.provider === AI_PROVIDERS.GEMINI && config.geminiApiKey?.trim().length > 10) return true;
    if (config.provider === AI_PROVIDERS.OPENAI && config.openaiApiKey?.trim().length > 10) return true;
    return false;
  }

  /**
   * Teste de conexão ativa com o provedor de IA
   */
  static async testConnection({ provider, apiKey, model } = {}) {
    const current = this.getConfig();
    const activeProvider = provider || current.provider;
    const key = apiKey !== undefined ? apiKey : (activeProvider === AI_PROVIDERS.GEMINI ? current.geminiApiKey : current.openaiApiKey);
    const activeModel = model || (activeProvider === AI_PROVIDERS.GEMINI ? current.geminiModel : current.openaiModel);

    const startTime = performance.now();

    if (!key || key.trim().length < 8) {
      return {
        success: false,
        latencyMs: 0,
        message: 'Chave de API não informada. Insira uma chave válida do Google Gemini ou OpenAI.'
      };
    }

    try {
      if (activeProvider === AI_PROVIDERS.GEMINI) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${key.trim()}`;
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Responda estritamente: "OK"' }] }]
          })
        });

        const latencyMs = Math.round(performance.now() - startTime);

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.error?.message || `HTTP ${resp.status}`);
        }

        return {
          success: true,
          latencyMs,
          provider: 'Google Gemini',
          model: activeModel,
          message: `Conexão bem-sucedida com Google Gemini (${activeModel}) em ${latencyMs}ms.`
        };
      }

      if (activeProvider === AI_PROVIDERS.OPENAI) {
        const endpoint = 'https://api.openai.com/v1/chat/completions';
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key.trim()}`
          },
          body: JSON.stringify({
            model: activeModel,
            messages: [{ role: 'user', content: 'Responda estritamente: "OK"' }],
            max_tokens: 5
          })
        });

        const latencyMs = Math.round(performance.now() - startTime);

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.error?.message || `HTTP ${resp.status}`);
        }

        return {
          success: true,
          latencyMs,
          provider: 'OpenAI',
          model: activeModel,
          message: `Conexão bem-sucedida com OpenAI (${activeModel}) em ${latencyMs}ms.`
        };
      }

      return { success: false, latencyMs: 0, message: 'Provedor não suportado.' };
    } catch (err) {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        success: false,
        latencyMs,
        message: `Falha ao conectar com ${activeProvider}: ${err.message}`
      };
    }
  }

  /**
   * Analisa profundamente o Edital em PDF ou Texto com IA
   */
  static async analyzeEditalWithAI(editalText, context = {}) {
    if (!this.isConfigured()) {
      return this._fallbackHeuristicAnalysis(editalText, context);
    }

    const config = this.getConfig();
    const prompt = `Você é o Engenheiro Especialista em Licitações Públicas do sistema Vellia Licitações.
Sua missão é analisar o edital abaixo e gerar uma auditoria técnica e comercial completa para as empresas:
1. "Veeluen Solutions": Engenharia mecânica, operação de Estações de Tratamento de Efluentes (ETE), saneamento, calibração e inspeção NR-13 (vasos de pressão e caldeiras).
2. "Excelência Ambiental": Monitoramento de emissões atmosféricas, qualidade do ar, amostragem isocinética, modelagem AERMOD, licenciamento ambiental.

TEXTO DO EDITAL / TERMO DE REFERÊNCIA:
"""
${editalText.slice(0, 15000)}
"""

Retorne OBRIGATORIAMENTE um JSON válido com a seguinte estrutura:
{
  "resumoExecutivo": "Resumo claro do objeto, cliente, local de execução e regime de contratação",
  "empresaRecomendada": "Veeluen Solutions" ou "Excelência Ambiental",
  "aderenciaEstimada": 90,
  "justificativaAderencia": "Por que esta oportunidade é ou não adequada ao portfólio",
  "requisitosHabilitacao": [
    { "categoria": "Qualificação Técnica", "descricao": "Exigência de atestado técnico...", "obrigatoriedade": "OBRIGATÓRIO" }
  ],
  "matrizRiscos": [
    { "risco": "Descrição da cláusula perigosa", "severidade": "ALTA" ou "MÉDIA", "impacto": "Multas diárias ou rescisão" }
  ],
  "prazosFatais": {
    "visitaTecnica": "Data ou Não Obrigatória",
    "impugnacao": "Prazo legal",
    "esclarecimento": "Prazo legal"
  },
  "recomendacaoGoNoGo": "GO" ou "NO-GO",
  "motivoDecisao": "Síntese da decisão executiva recomendada"
}`;

    try {
      let rawResponse = '';

      if (config.provider === AI_PROVIDERS.GEMINI) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey.trim()}`;
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: config.temperature,
              maxOutputTokens: config.maxTokens
            }
          })
        });

        if (!resp.ok) throw new Error(`Erro Gemini (${resp.status}): ${resp.statusText}`);
        const data = await resp.json();
        rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else if (config.provider === AI_PROVIDERS.OPENAI) {
        const endpoint = 'https://api.openai.com/v1/chat/completions';
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.openaiApiKey.trim()}`
          },
          body: JSON.stringify({
            model: config.openaiModel,
            messages: [{ role: 'user', content: prompt }],
            temperature: config.temperature,
            max_tokens: config.maxTokens
          })
        });

        if (!resp.ok) throw new Error(`Erro OpenAI (${resp.status}): ${resp.statusText}`);
        const data = await resp.json();
        rawResponse = data.choices?.[0]?.message?.content || '';
      }

      // Limpeza de blocos markdown ```json
      const cleanedJson = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);
      parsed.sourceEngine = `IA Generativa em Nuvem (${config.provider === AI_PROVIDERS.GEMINI ? config.geminiModel : config.openaiModel})`;
      return parsed;

    } catch (err) {
      logService.addLog(LogType.WARN, `Falha na consulta à IA (${err.message}). Acionando análise heurística local.`);
      return this._fallbackHeuristicAnalysis(editalText, context);
    }
  }

  /**
   * Copilot "Pergunte ao Edital" com IA Generativa
   */
  static async askEditalCopilotWithAI(editalText, questionText, context = {}) {
    if (!this.isConfigured()) {
      return null; // O chamador usa o fallback estrito
    }

    const config = this.getConfig();
    const prompt = `Você é o Assistente Especialista de Editais do Vellia Licitações.
Sua regra suprema é: RESPONDA COM BASE ESTRITA NO TEXTO DO EDITAL FORNECIDO.
Se a resposta não constar no edital, diga exatamente: "Não identifiquei essa informação nos documentos analisados."
Nunca invente regras, leis ou prazos que não estejam explícitos no texto.

DOCUMENTO DO EDITAL:
"""
${editalText.slice(0, 14000)}
"""

PERGUNTA DA EQUIPE:
"${questionText}"

Responda em formato estruturado:
1. Resposta direta e objetiva
2. Seção ou item de referência do edital
3. Grau de certeza (ALTO, MÉDIO)`;

    try {
      let rawText = '';
      if (config.provider === AI_PROVIDERS.GEMINI) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey.trim()}`;
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 1000 }
          })
        });
        if (resp.ok) {
          const d = await resp.json();
          rawText = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } else if (config.provider === AI_PROVIDERS.OPENAI) {
        const endpoint = 'https://api.openai.com/v1/chat/completions';
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.openaiApiKey.trim()}`
          },
          body: JSON.stringify({
            model: config.openaiModel,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
            max_tokens: 1000
          })
        });
        if (resp.ok) {
          const d = await resp.json();
          rawText = d.choices?.[0]?.message?.content || '';
        }
      }

      if (rawText.trim().length > 10) {
        return {
          answer: rawText,
          sources: [{ documentName: context.fileName || 'Edital_Oficial.pdf', page: 'Texto Consolidado', section: 'Trecho Auditado por IA' }],
          confidence: 'ALTA (IA Generativa)',
          engine: config.provider === AI_PROVIDERS.GEMINI ? config.geminiModel : config.openaiModel
        };
      }
    } catch (err) {
      console.warn('[AiCopilot] Erro ao consultar IA:', err);
    }
    return null;
  }

  /**
   * Análise Heurística Local (Fallback 100% Offline)
   */
  static _fallbackHeuristicAnalysis(editalText, context = {}) {
    const text = (editalText || '').toLowerCase();
    const isAmbiental = text.includes('emiss') || text.includes('atmosf') || text.includes('ar') || text.includes('chamin');
    const isSaneamento = text.includes('ete') || text.includes('efluente') || text.includes('esgoto') || text.includes('resíduo');
    const isMecanica = text.includes('nr-13') || text.includes('caldeira') || text.includes('vaso de pressão') || text.includes('spda');

    const empresa = isAmbiental ? 'Excelência Ambiental' : 'Veeluen Solutions';
    const score = isAmbiental || isSaneamento || isMecanica ? 92 : 72;

    return {
      resumoExecutivo: `Contratação de serviços de engenharia especializada. Objeto: ${context.object || 'Prestação continuada de serviços técnicos de operação, manutenção e conformidade normativa.'}`,
      empresaRecomendada: empresa,
      aderenciaEstimada: score,
      justificativaAderencia: `Objeto com alta correlação semântica com o acervo técnico de ${empresa}.`,
      requisitosHabilitacao: [
        { categoria: 'Qualificação Técnica', descricao: 'Atestado de capacidade técnica em serviços similares emitido por pessoa jurídica de direito público ou privado.', obrigatoriedade: 'OBRIGATÓRIO' },
        { categoria: 'Registro Profissional', descricao: 'Certidão de Registro e Quitação no CREA com responsável técnico habilitado.', obrigatoriedade: 'OBRIGATÓRIO' },
        { categoria: 'Saúde e Segurança', descricao: 'Apresentação de PGR, PCMSO e conformidade com NRs do MTE.', obrigatoriedade: 'OBRIGATÓRIO' }
      ],
      matrizRiscos: [
        { risco: 'Prazo exíguo para mobilização de equipe técnica residente', severidade: 'MÉDIA', impacto: 'Risco de multa por atraso no início da operação' },
        { risco: 'Exigência de índice de liquidez corrente superior a 1.25', severidade: 'BAIXA', impacto: 'Necessidade de balanço patrimonial auditado' }
      ],
      prazosFatais: {
        visitaTecnica: text.includes('visita') ? 'Recomendada / Verificar agendamento prévio' : 'Não identificada',
        impugnacao: 'Até 3 dias úteis antes da abertura (Lei 14.133/21)',
        esclarecimento: 'Até 3 dias úteis antes da abertura'
      },
      recomendacaoGoNoGo: score >= 80 ? 'GO' : 'REVISÃO',
      motivoDecisao: 'Oportunidade elegível com alta competitividade técnica e aderência aos atestados existentes.',
      sourceEngine: 'Léxico Local (Heurística de Engenharia)'
    };
  }
}
