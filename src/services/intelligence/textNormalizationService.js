/**
 * VELLIA LICITAÇÕES — FASE 27: OTIMIZAÇÃO DA INTELIGÊNCIA DO AGENTE
 * textNormalizationService.js: Normalização avançada de texto preservando termos técnicos,
 * corrigindo ruídos comuns de OCR e padronizando variações lexicais sem destruir significado.
 * (Itens 4, 5, 133, 134 e 135)
 */

// Lista de termos técnicos e acrônimos protegidos que NÃO devem ser fragmentados ou corrompidos
export const PROTECTED_TECHNICAL_TERMS = [
  'NR-13', 'NR-10', 'NR-12', 'NR-33', 'NR-35',
  'AERMOD', 'AERMET', 'AERMAP', 'CALPUFF',
  'ETE', 'ETA', 'ETEI',
  'SPDA', 'PGRS', 'PGR', 'PCMSO', 'PPRA', 'PMTA',
  'NOx', 'SOx', 'CO', 'CO2', 'O2', 'VOCs', 'H2S', 'CH4',
  'PTS', 'PM10', 'PM2.5', 'PM-10', 'PM-2.5',
  'CONAMA 430', 'CONAMA 382', 'CONAMA 491', 'CONAMA 357',
  'NBR 12019', 'NBR 12020', 'NBR 5419', 'NBR 10151',
  'EPA 5', 'EPA METHOD 5', 'GHG PROTOCOL', 'AP-42',
  'ART', 'CAT', 'CREA', 'CRQ'
];

// Padrões de ruído de OCR frequentes em editais e digitalizações de diários oficiais
const OCR_NOISE_REPLACEMENTS = [
  // Acrônimos espaçados por OCR defeituoso ou pontuados (ex: N.R. 13, N R - 13)
  { regex: /\bN\s*\.?\s*R\s*\.?\s*[-–—_]?\s*1\s*3\b/gi, replacement: 'NR-13' },
  { regex: /\bN\s*\.?\s*R\s*\.?\s*[-–—_]?\s*1\s*0\b/gi, replacement: 'NR-10' },
  { regex: /\bN\s*\.?\s*R\s*\.?\s*[-–—_]?\s*1\s*2\b/gi, replacement: 'NR-12' },
  { regex: /\bN\s*\.?\s*R\s*\.?\s*[-–—_]?\s*3\s*3\b/gi, replacement: 'NR-33' },
  { regex: /\bN\s*\.?\s*R\s*\.?\s*[-–—_]?\s*3\s*5\b/gi, replacement: 'NR-35' },
  { regex: /\bE\s*\.?\s*T\s*\.?\s*E\b/gi, replacement: 'ETE' },
  { regex: /\bE\s*\.?\s*T\s*\.?\s*A\b/gi, replacement: 'ETA' },
  { regex: /\bS\s*\.?\s*P\s*\.?\s*D\s*\.?\s*A\b/gi, replacement: 'SPDA' },
  { regex: /\bP\s*\.?\s*G\s*\.?\s*R\s*\.?\s*S\b/gi, replacement: 'PGRS' },
  { regex: /\bP\s*\.?\s*M\s*\.?\s*T\s*\.?\s*A\b/gi, replacement: 'PMTA' },
  { regex: /\bA\s*E\s*R\s*M\s*O\s*D\b/gi, replacement: 'AERMOD' },
  { regex: /\bC\s*O\s*N\s*A\s*M\s*A\b/gi, replacement: 'CONAMA' },
  { regex: /\bN\s*B\s*R\b/gi, replacement: 'NBR' },
  { regex: /\bN\s*O\s*x\b/gi, replacement: 'NOx' },
  { regex: /\bS\s*O\s*x\b/gi, replacement: 'SOx' },
  { regex: /\bP\s*M\s*[-–—]?\s*1\s*0\b/gi, replacement: 'PM10' },
  { regex: /\bP\s*M\s*[-–—]?\s*2\s*[\.,]\s*5\b/gi, replacement: 'PM2.5' },
  
  // Variações e erros de digitação comuns
  { regex: /\bisocineti[ck]a\b/gi, replacement: 'isocinética' },
  { regex: /\bcaldeiras?\s+flamo[\s-]?tubular(es)?\b/gi, replacement: 'caldeira flamotubular' },
  { regex: /\bcaldeiras?\s+aquo[\s-]?tubular(es)?\b/gi, replacement: 'caldeira aquotubular' },
  { regex: /\bfontes?\s+estacionari[ao]s?\b/gi, replacement: 'fontes estacionárias' },
  { regex: /\befluentes?\s+gasos[ao]s?\b/gi, replacement: 'efluentes gasosos' },
  { regex: /\bdescargas?\s+atmosferi[ck]as?\b/gi, replacement: 'descargas atmosféricas' }
];

export class TextNormalizationService {
  /**
   * Normalização padrão para leitura semântica:
   * Preserva termos técnicos protegidos, limpa ruídos de OCR e espaços redundantes.
   */
  static normalize(text = '') {
    if (!text || typeof text !== 'string') return '';

    let clean = text.trim();

    // 1. Unificar quebras de linha e tabulações em espaço simples
    clean = clean.replace(/[\r\n\t]+/g, ' ');

    // 2. Corrigir ruídos de OCR conhecidos
    for (const rule of OCR_NOISE_REPLACEMENTS) {
      clean = clean.replace(rule.regex, rule.replacement);
    }

    // 3. Normalizar hifens e aspas tipográficas
    clean = clean.replace(/[–—]/g, '-');
    clean = clean.replace(/[“”"']/g, '"');

    // 4. Compactar múltiplos espaços
    clean = clean.replace(/\s{2,}/g, ' ');

    return clean;
  }

  /**
   * Normalização canônica para busca de termos (sem acentos, minúsculo, mantendo termos técnicos reconhecíveis)
   */
  static toSearchCanonical(text = '') {
    if (!text || typeof text !== 'string') return '';

    const normalized = this.normalize(text);

    // Substituir temporariamente termos técnicos protegidos com marcadores seguros
    const protectedPlaceholders = new Map();
    let tokenized = normalized;

    PROTECTED_TECHNICAL_TERMS.forEach((term, index) => {
      const placeholder = `__PROT_${index}__`;
      const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (regex.test(tokenized)) {
        protectedPlaceholders.set(placeholder, term);
        tokenized = tokenized.replace(regex, placeholder);
      }
    });

    // Remover acentos do restante do texto
    let decomposed = tokenized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Converter para minúsculo
    decomposed = decomposed.toLowerCase();

    // Restaurar termos técnicos preservados (em minúsculo normalizado ou original)
    protectedPlaceholders.forEach((originalTerm, placeholder) => {
      decomposed = decomposed.replace(new RegExp(placeholder.toLowerCase(), 'g'), originalTerm.toLowerCase());
    });

    return decomposed.trim();
  }

  /**
   * Extrai tokens canônicos significativos (removendo stop words genéricas)
   */
  static extractMeaningfulTokens(text = '') {
    const canonical = this.toSearchCanonical(text);
    const stopWords = new Set([
      'de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'com', 'nao', 'uma',
      'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'ao', 'ele',
      'das', 'seu', 'sua', 'ou', 'quando', 'muito', 'nos', 'ja', 'eu', 'tambem', 'so',
      'pelo', 'pela', 'ate', 'isso', 'ela', 'entre', 'depois', 'sem', 'mesmo', 'aos',
      'seus', 'quem', 'nas', 'me', 'esse', 'eles', 'voce', 'essa', 'num', 'nem', 'suas',
      'meu', 'as', 'minha', 'numa', 'pelos', 'elas', 'qual', 'nos', 'lhe', 'deles',
      'essas', 'esses', 'pelas', 'este', 'dele', 'tu', 'te', 'voces', 'vos', 'lhes',
      'meus', 'minhas', 'teu', 'tua', 'teus', 'tuas', 'nosso', 'nossa', 'nossos', 'nossas',
      'dela', 'delas', 'esta', 'estes', 'estas', 'aquele', 'aquela', 'aqueles', 'aquelas',
      'isto', 'aquilo', 'estou', 'esta', 'estamos', 'estao', 'estive', 'esteve', 'estivemos'
    ]);

    return canonical
      .split(/[^a-z0-9\-_]/)
      .filter(t => t.length > 2 && !stopWords.has(t));
  }
}
