/**
 * editalPdfParserService.js
 * Serviço inteligente para ingestão, extração e parsing de Editais e Termos de Referência
 * Suporta PDF, TXT, HTML, DOCX e texto copiado/colado.
 */

import { analyzeOpportunityAdherence } from '../semanticEngine.js';

export class EditalPdfParserService {
  /**
   * Extrai texto de um arquivo File (PDF, TXT, HTML, etc.)
   * @param {File} file 
   * @returns {Promise<{ rawText: string, fileName: string, fileSize: number, fileType: string }>}
   */
  static async extractTextFromFile(file) {
    if (!file) {
      throw new Error('Nenhum arquivo fornecido.');
    }

    const fileName = file.name || 'edital_desconhecido.pdf';
    const fileSize = file.size || 0;
    const fileType = file.type || '';
    const extension = fileName.split('.').pop()?.toLowerCase();

    // 1. Arquivos de texto puro, HTML, JSON, CSV
    if (['txt', 'html', 'htm', 'json', 'csv', 'md'].includes(extension) || fileType.includes('text')) {
      const text = await this._readAsText(file);
      return { rawText: text, fileName, fileSize, fileType };
    }

    // 2. Arquivos PDF
    if (extension === 'pdf' || fileType.includes('pdf')) {
      const arrayBuffer = await this._readAsArrayBuffer(file);
      const extractedText = this._extractTextFromPdfArrayBuffer(arrayBuffer);
      
      // Se a extração binária recuperar pouco texto (ex: PDF escaneado ou comprimido com filtros customizados)
      if (!extractedText || extractedText.trim().length < 40) {
        return {
          rawText: '',
          fileName,
          fileSize,
          fileType,
          isScannedOrEncrypted: true,
          notice: 'O PDF enviado parece ser digitalizado/imagem ou protegido por criptografia. Utilize a aba "Colar Texto" para processar o conteúdo diretamente.'
        };
      }

      return { rawText: extractedText, fileName, fileSize, fileType };
    }

    // 3. Fallback: tentar leitura como texto
    try {
      const fallbackText = await this._readAsText(file);
      return { rawText: fallbackText, fileName, fileSize, fileType };
    } catch {
      throw new Error(`Formato de arquivo .${extension} não suportado diretamente. Envie PDF ou copie o texto do edital.`);
    }
  }

  /**
   * Lê File como texto utf-8
   */
  static _readAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result || '');
      reader.onerror = (e) => reject(new Error('Falha ao ler o arquivo como texto.'));
      reader.readAsText(file, 'utf-8');
    });
  }

  /**
   * Lê File como ArrayBuffer
   */
  static _readAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result);
      reader.onerror = (e) => reject(new Error('Falha ao ler o arquivo em memória.'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Extrator leve de texto contido em streams PDF
   */
  static _extractTextFromPdfArrayBuffer(arrayBuffer) {
    if (!arrayBuffer) return '';
    const bytes = new Uint8Array(arrayBuffer);
    
    // Converte bytes para string em blocos para evitar estouro de pilha
    let binaryString = '';
    const chunkSize = 16384;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binaryString += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }

    const textPieces = [];

    // 1. Extração de blocos BT ... ET (Begin Text ... End Text)
    const btRegex = /BT[\s\S]*?ET/g;
    let match;
    while ((match = btRegex.exec(binaryString)) !== null) {
      const block = match[0];
      
      // Strings entre parênteses: (Texto)
      const parenRegex = /\(([^)]+)\)/g;
      let pMatch;
      while ((pMatch = parenRegex.exec(block)) !== null) {
        const cleanPiece = pMatch[1]
          .replace(/\\n/g, ' ')
          .replace(/\\r/g, ' ')
          .replace(/\\t/g, ' ')
          .replace(/\\([0-7]{1,3})/g, (m, oct) => String.fromCharCode(parseInt(oct, 8)))
          .trim();
        if (cleanPiece.length > 1) {
          textPieces.push(cleanPiece);
        }
      }

      // Strings hexadecimais: <48656C6C6F>
      const hexRegex = /<([0-9A-Fa-f]{4,})>/g;
      let hMatch;
      while ((hMatch = hexRegex.exec(block)) !== null) {
        const hex = hMatch[1];
        let str = '';
        for (let j = 0; j < hex.length; j += 2) {
          str += String.fromCharCode(parseInt(hex.substr(j, 2), 16));
        }
        if (str.trim().length > 1 && /^[\x20-\x7E\xA0-\xFF\s]+$/.test(str)) {
          textPieces.push(str.trim());
        }
      }
    }

    // Se extraiu texto de blocos BT, consolida
    if (textPieces.length > 10) {
      return textPieces.join(' ').replace(/\s+/g, ' ');
    }

    // 2. Extração fallback de sequências legíveis no PDF
    const textChunks = binaryString.match(/[\x20-\x7E\xA0-\xFF]{4,}/g) || [];
    const filtered = textChunks.filter(c => {
      // Ignorar comandos típicos de estrutura de PDF
      if (c.startsWith('/Font') || c.startsWith('/Obj') || c.startsWith('/Filter') || c.startsWith('/Length')) return false;
      return true;
    });

    return filtered.join(' ').replace(/\s+/g, ' ');
  }

  /**
   * Realiza o parsing estrutural e semântico do texto extraído de um edital
   * @param {string} rawText 
   * @param {string} [fileName] 
   * @returns {Object} Dados estruturados da oportunidade prontos para análise
   */
  static parseEditalText(rawText, fileName = '') {
    if (!rawText || rawText.trim().length === 0) {
      throw new Error('Texto do edital está vazio para processamento.');
    }

    const text = rawText.replace(/\r\n/g, '\n');

    // 1. Número do Certame / Processo
    const number = this._extractNumber(text, fileName);

    // 2. Órgão / Contratante
    const client = this._extractClient(text);

    // 3. Modalidade
    const modality = this._extractModality(text);

    // 4. Portal provável
    const portal = this._detectPortal(text, client);

    // 5. Objeto da Licitação
    const object = this._extractObject(text, fileName);

    // 6. Título sintetizado
    const title = this._synthesizeTitle(object, modality, number);

    // 7. Prazos (data de abertura/encerramento)
    const dates = this._extractDates(text);

    // 8. Valor estimado
    const estimatedValue = this._extractEstimatedValue(text);

    // 9. Localidade (Cidade/Estado)
    const locationInfo = this._extractLocation(text, client);

    // 10. Requisitos Chave e Anexos Identificados
    const requirementsPreview = this._extractKeyRequirements(text);

    // 11. Análise semântica preliminar usando o Motor do Vellia
    const contextualAnalysis = analyzeOpportunityAdherence({
      title,
      object,
      description: object,
      location: locationInfo.location,
      daysLeft: dates.daysLeft
    });

    return {
      portal,
      number,
      client,
      title,
      object,
      description: object,
      modality,
      publishDate: dates.publishDate,
      endDate: dates.endDate,
      daysLeft: dates.daysLeft,
      estimatedValue: estimatedValue.formatted,
      estimatedValueRaw: estimatedValue.raw,
      city: locationInfo.city,
      state: locationInfo.state,
      location: locationInfo.location,
      url: portal === 'Petronect' ? `https://petronect.com/portal/licitacao/${number}` : 'https://pncp.gov.br',
      requirementsPreview,
      fileName,
      // Insights semânticos pré-calculados
      recommendedCompany: contextualAnalysis.recommendedCompany,
      primaryService: contextualAnalysis.primaryServiceName,
      score: contextualAnalysis.finalScore,
      scoreTier: contextualAnalysis.tierKey,
      matchedKeywords: contextualAnalysis.matchedKeywords,
      explanationSummary: contextualAnalysis.explanationSummary
    };
  }

  // --- MÉTODOS DE EXTRAÇÃO HEURÍSTICA ---

  static _extractNumber(text, fileName) {
    // Busca no nome do arquivo
    const fileMatch = fileName.match(/(\d{6,12})/);
    if (fileMatch) return fileMatch[1];

    // Busca no texto
    const patterns = [
      /(?:pregão|pregao|licitação|licitacao|oportunidade|processo)\s*(?:eletrônico|eletronico|presencial)?\s*(?:n[º°.]|número|numero)?\s*[:\s]*(\d{4,10}[\/\-\.]\d{2,4}|\d{7,10})/i,
      /(?:edital)\s*(?:n[º°.]|número)?\s*[:\s]*(\d{2,10}[\/\-\.]\d{2,4}|\d{6,10})/i,
      /(?:n[º°.]\s*da\s*oportunidade|id\s*petronect)[:\s]*(\d{6,10})/i,
      /\b(700\d{7})\b/ // Padrão clássico de IDs Petronect Petrobras
    ];

    for (const pat of patterns) {
      const match = text.match(pat);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return `ED-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  static _extractClient(text) {
    const knownClients = [
      { name: 'Petrobras - Petróleo Brasileiro S.A.', regex: /petrobras|petróleo brasileiro|petroleo brasileiro/i },
      { name: 'Transpetro - Petrobras Transporte S.A.', regex: /transpetro|petrobras transporte/i },
      { name: 'Refinaria Abreu e Lima (RNEST)', regex: /abreu e lima|rnest/i },
      { name: 'Refinaria de Paulínia (REPLAN)', regex: /replan|paulinia|paulínia/i },
      { name: 'Refinaria Duque de Caxias (REDUC)', regex: /reduc|duque de caxias/i },
      { name: 'Terminal de Suape', regex: /terminal de suape|porto de suape/i },
      { name: 'Companhia Pernambucana de Saneamento (Compesa)', regex: /compesa/i },
      { name: 'Sabesp - Cia de Saneamento Básico de SP', regex: /sabesp/i },
      { name: 'Sanepar - Cia de Saneamento do Paraná', regex: /sanepar/i },
      { name: 'Cedae - Cia Estadual de Águas e Esgotos RJ', regex: /cedae/i },
      { name: 'Tribunal de Justiça do Estado do Rio de Janeiro (TJRJ)', regex: /tjrj|tribunal de justiça.*rio de janeiro/i },
      { name: 'Tribunal de Justiça de Pernambuco (TJPE)', regex: /tjpe|tribunal de justiça.*pernambuco/i },
      { name: 'Eletronuclear', regex: /eletronuclear|eletrobras termonuclear/i },
      { name: 'Chesf - Cia Hidroelétrica do São Francisco', regex: /chesf/i }
    ];

    for (const client of knownClients) {
      if (client.regex.test(text)) {
        return client.name;
      }
    }

    // Busca por Prefeituras
    const prefMatch = text.match(/prefeitura\s+(?:municipal\s+)?(?:de|do|da)?\s+([A-ZÀ-Úa-zà-ú\s]{3,35})/i);
    if (prefMatch) {
      return `Prefeitura Municipal de ${prefMatch[1].trim()}`;
    }

    // Busca por Órgão/Contratante expresso
    const organMatch = text.match(/(?:órgão|orgao|contratante|entidade)[:\s]+([^\n\r,]{4,50})/i);
    if (organMatch) {
      return organMatch[1].trim();
    }

    return 'Órgão Licitante (Apurar pelo cabeçalho)';
  }

  static _extractModality(text) {
    if (/pregão eletrônico|pregao eletronico/i.test(text)) return 'Pregão Eletrônico';
    if (/dispensa de licitação|dispensa eletronica/i.test(text)) return 'Dispensa de Licitação';
    if (/concorrência eletrônica|concorrencia/i.test(text)) return 'Concorrência';
    if (/tomada de preços|tomada de precos/i.test(text)) return 'Tomada de Preços';
    if (/petronect/i.test(text)) return 'Licitação Eletrônica Petronect';
    return 'Pregão Eletrônico';
  }

  static _detectPortal(text, client) {
    if (/petronect/i.test(text) || /petrobras|transpetro/i.test(client)) {
      return 'Petronect';
    }
    if (/pncp|portal nacional de contratações/i.test(text)) {
      return 'PNCP';
    }
    if (/comprasnet|compras\.gov\.br/i.test(text)) {
      return 'Compras.gov.br';
    }
    return 'PNCP';
  }

  static _extractObject(text, fileName) {
    const objectPatterns = [
      /(?:1\.\s*)?DO OBJETO[:\s]*\n?([\s\S]{30,800}?)(?=\n\s*(?:2\.|1\.1|DO VALOR|DO PRAZO|DA PARTICIPAÇÃO|DAS CONDIÇÕES|LOCAL|$))/i,
      /(?:objeto da licitação|objeto deste certame|objeto contratual)[:\s]*\n?([\s\S]{30,800}?)(?=\n\s*(?:2\.|1\.1|DO VALOR|DO PRAZO|DA PARTICIPAÇÃO|$))/i,
      /(?:contratação de|prestação de serviços de|prestacao de servicos de)[\s\S]{20,500}?(?=\.|\n\n)/i
    ];

    for (const pat of objectPatterns) {
      const match = text.match(pat);
      if (match && match[0]) {
        let clean = (match[1] || match[0])
          .replace(/\s+/g, ' ')
          .replace(/^(objeto[:\s-]*|do objeto[:\s-]*)/i, '')
          .trim();
        if (clean.length > 25) {
          return clean.length > 500 ? clean.substring(0, 500) + '...' : clean;
        }
      }
    }

    // Fallback: usar nome do arquivo formatado
    const cleanFileName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    return `Contratação de serviços de engenharia e consultoria especializada conforme especificações constantes no Edital ${cleanFileName}.`;
  }

  static _synthesizeTitle(object, modality, number) {
    if (!object) return `${modality} nº ${number}`;
    
    // Tenta pegar a primeira frase do objeto até 100 caracteres
    const firstSentence = object.split(/[.;\n]/)[0].trim();
    if (firstSentence.length >= 20 && firstSentence.length <= 110) {
      return firstSentence;
    }
    if (firstSentence.length > 110) {
      return firstSentence.substring(0, 107) + '...';
    }
    return `Serviços especializados - ${modality} nº ${number}`;
  }

  static _extractDates(text) {
    const now = new Date();
    const dateRegex = /\b(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})\b/g;
    const foundDates = [];
    let match;

    while ((match = dateRegex.exec(text)) !== null) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const year = parseInt(match[3], 10);
      const d = new Date(year, month, day);

      if (!isNaN(d.getTime()) && year >= 2025 && year <= 2030) {
        foundDates.push({ str: `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`, dateObj: d });
      }
    }

    // Datas futuras para encerramento
    const futureDates = foundDates.filter(item => item.dateObj >= now);
    
    let endDate = '30/10/2026';
    let daysLeft = 8;

    if (futureDates.length > 0) {
      // Pega a data futura mais próxima como data de encerramento
      futureDates.sort((a, b) => a.dateObj - b.dateObj);
      endDate = futureDates[0].str;
      const diffMs = futureDates[0].dateObj - now;
      daysLeft = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    const publishDate = new Date().toLocaleDateString('pt-BR');

    return { publishDate, endDate, daysLeft };
  }

  static _extractEstimatedValue(text) {
    // Procura por valores em Reais próximos de termos de orçamento
    const valueRegex = /(?:valor estimado|valor global|orçamento|orcamento|valor total|referência|referencia)[\s\S]{0,80}?R\$\s*([\d\.,]+)/i;
    const match = text.match(valueRegex);

    if (match && match[1]) {
      const rawNumberStr = match[1].replace(/\./g, '').replace(',', '.');
      const val = parseFloat(rawNumberStr);
      if (!isNaN(val) && val > 1000) {
        return {
          formatted: `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          raw: val
        };
      }
    }

    // Se houver qualquer R$ no documento
    const anyMoneyMatch = text.match(/R\$\s*([\d\.,]{6,14})/);
    if (anyMoneyMatch && anyMoneyMatch[1]) {
      const val = parseFloat(anyMoneyMatch[1].replace(/\./g, '').replace(',', '.'));
      if (!isNaN(val) && val > 10000) {
        return {
          formatted: `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          raw: val
        };
      }
    }

    return { formatted: 'Sob consulta', raw: null };
  }

  static _extractLocation(text, client) {
    const locations = [
      { city: 'Ipojuca', state: 'PE', regex: /ipojuca|suape/i },
      { city: 'Recife', state: 'PE', regex: /recife/i },
      { city: 'Macaé', state: 'RJ', regex: /macaé|macae/i },
      { city: 'Rio de Janeiro', state: 'RJ', regex: /rio de janeiro|tjrj/i },
      { city: 'Santos', state: 'SP', regex: /santos|bacia de santos/i },
      { city: 'Paulínia', state: 'SP', regex: /paulínia|paulinia|replan/i },
      { city: 'Camaçari', state: 'BA', regex: /camaçari|camacari/i },
      { city: 'Betim', state: 'MG', regex: /betim|regap/i },
      { city: 'Curitiba', state: 'PR', regex: /curitiba|repar/i }
    ];

    for (const loc of locations) {
      if (loc.regex.test(text) || loc.regex.test(client)) {
        return { city: loc.city, state: loc.state, location: `${loc.city} - ${loc.state}` };
      }
    }

    return { city: 'Recife', state: 'PE', location: 'PE (Regional)' };
  }

  static _extractKeyRequirements(text) {
    const requirements = [];

    if (/crea|confea|art|anotação de responsabilidade técnica/i.test(text)) {
      requirements.push({ type: 'TÉCNICO', label: 'Registro no CREA e ART do Responsável Técnico' });
    }
    if (/atestado de capacidade técnica|atestado.*similaridade/i.test(text)) {
      requirements.push({ type: 'CAPACIDADE', label: 'Atestados de Capacidade Técnica de serviços similares' });
    }
    if (/visita técnica|vistoria/i.test(text)) {
      requirements.push({ type: 'OPERACIONAL', label: 'Visita técnica ou Declaração Formal de Conhecimento do Local' });
    }
    if (/cnd|regularidade fiscal|certidão negativa/i.test(text)) {
      requirements.push({ type: 'HABILITAÇÃO', label: 'Certidões Negativas de Débitos Federais, Estaduais e Trabalhistas' });
    }
    if (/balanço patrimonial|índice de liquidez/i.test(text)) {
      requirements.push({ type: 'FINANCEIRO', label: 'Balanço Patrimonial e Índices de Liquidez Corrente/Geral' });
    }
    if (/nr-13|caldeiras|vasos de pressão/i.test(text)) {
      requirements.push({ type: 'NORMA', label: 'Conformidade com a Norma Regulamentadora NR-13' });
    }
    if (/conama|cprh|amostragem isocinética/i.test(text)) {
      requirements.push({ type: 'AMBIENTAL', label: 'Conformidade com Resoluções CONAMA e CPRH' });
    }

    return requirements;
  }
}
