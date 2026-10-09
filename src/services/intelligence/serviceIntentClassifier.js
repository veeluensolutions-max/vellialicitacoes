/**
 * VELLIA LICITAÇÕES — FASE 27: OTIMIZAÇÃO DA INTELIGÊNCIA DO AGENTE
 * serviceIntentClassifier.js: Classificador de Intenção de Contratação.
 * Separação rigorosa entre prestação de SERVIÇO vs compra/fornecimento de EQUIPAMENTO ou MATERIAL.
 * (Itens 11 a 15, 129 a 132)
 */

export const ServiceIntent = {
  SERVICO: 'SERVIÇO',           // Prestação de serviços contínuos ou especializados
  FORNECIMENTO: 'FORNECIMENTO', // Aquisição, compra ou entrega de bens/equipamentos sem mão de obra
  LOCACAO: 'LOCAÇÃO',           // Aluguel de veículos ou máquinas
  OBRA: 'OBRA',                 // Construção civil pesada, pavimentação, terraplenagem
  MATERIAL: 'MATERIAL',         // Consumo descartável, embalagens, expediente
  CONSULTORIA: 'CONSULTORIA',   // Estudos de impacto, laudos, pareceres, inventários
  ANALISE: 'ANÁLISE',           // Ensaios laboratoriais, coletas pontuais
  MANUTENCAO: 'MANUTENÇÃO'      // Manutenção eletromecânica, preventiva e corretiva
};

// Padrões de evidência lexical e contextual para cada intenção
const INTENT_PATTERNS = [
  // 1. MATERIAL (Descartáveis, insumos puros)
  {
    intent: ServiceIntent.MATERIAL,
    weight: 9,
    regex: /\b(sacos?|embalagens?|recipientes?|lixeiras?|copos?|papel(aria)?|expediente|limpeza|uniformes?|equipamentos?\s+de\s+protecao\s+individual|epi\b)\b/i,
    negativeContextRegex: /\b(fornecimento|aquisicao|compra|suprimento)\s+de\s+(sacos?|recipientes?|embalagens?|papel|copos?|materiais?\s+de\s+expediente)\b/i
  },

  // 2. FORNECIMENTO / AQUISIÇÃO PURA DE EQUIPAMENTOS
  {
    intent: ServiceIntent.FORNECIMENTO,
    weight: 10,
    regex: /\b(aquisicao|compra|fornecimento|entrega|suprimento|fornecer|venda)\s+(e\s+fornecimento\s+)?(parcelado\s+)?(de\s+)?(equipamentos?|analisador(es)?|sensores?|estacoes?|bombas?|pecas?|instrumentos?|reagentes?|valvulas?|filtros?|softwares?)\b/i,
    verbs: ['adquirir', 'comprar', 'fornecer', 'suprir', 'entregar'],
    pureSupplyRegex: /\b(aquisicao|compra|fornecimento)\s+(direta|pura|parcelada)?\s+de\s+(bens|equipamentos|materiais|produtos)\b/i
  },

  // 3. LOCAÇÃO
  {
    intent: ServiceIntent.LOCACAO,
    weight: 7,
    regex: /\b(locacao|aluguel|arrendamento)\s+de\s+(veiculos?|maquinas?|caminhoes?|embarcacoes?|geradores?)\b/i
  },

  // 4. OBRA PESADA
  {
    intent: ServiceIntent.OBRA,
    weight: 7,
    regex: /\b(execucao|construcao|edificacao|reforma\s+predial|terraplenagem|pavimentacao|drenagem\s+pluvial)\s+de\s+obras?\b/i
  },

  // 5. MANUTENÇÃO TÉCNICA
  {
    intent: ServiceIntent.MANUTENCAO,
    weight: 8,
    regex: /\b(manutencao\s+preventiva|manutencao\s+corretiva|manutencao\s+preditiva|parada\s+de\s+manutencao|reparo|revisao\s+geral|comissionamento)\b/i
  },

  // 6. CONSULTORIA & ESTUDOS
  {
    intent: ServiceIntent.CONSULTORIA,
    weight: 8,
    regex: /\b(elaboracao\s+de\s+(estudo|relatorio|inventario|plano|projeto|laudo)|consultoria\s+ambiental|licenciamento\s+ambiental|pgrs|ghg\s+protocol)\b/i
  },

  // 7. ANÁLISE & AMOSTRAGEM
  {
    intent: ServiceIntent.ANALISE,
    weight: 8,
    regex: /\b(amostragem|caracterizacao|ensaio(s)?|medicao|coleta\s+e\s+analise|analise\s+quimica|ensaio\s+nao\s+destrutivo|teste\s+hidrostatico)\b/i
  },

  // 8. SERVIÇO TÉCNICO OPERACIONAL (Prioridade máxima da Vellia)
  {
    intent: ServiceIntent.SERVICO,
    weight: 9,
    regex: /\b(prestacao\s+de\s+servicos?|servicos?\s+tecnicos?|servicos?\s+especializados?|servicos?\s+continuados?|operacao\s+e\s+manutencao|operacao\s+continuada|monitoramento\s+continuo|gestao\s+e\s+operacao|inspecao\s+de\s+seguranca)\b/i
  }
];

export class ServiceIntentClassifier {
  /**
   * Classifica a intenção contratual do objeto da licitação
   */
  static classifyIntent(normalizedText = '') {
    if (!normalizedText || typeof normalizedText !== 'string') {
      return {
        primaryIntent: ServiceIntent.SERVICO,
        confidence: 'Baixa',
        isSupplyOnly: false,
        isServiceIntended: true,
        evidence: [],
        explanation: 'Texto vazio ou indefinido.'
      };
    }

    const text = normalizedText.toLowerCase();
    const detectedIntents = [];

    // Checar cada intenção mapeada
    for (const pattern of INTENT_PATTERNS) {
      const match = text.match(pattern.regex);
      if (match) {
        detectedIntents.push({
          intent: pattern.intent,
          weight: pattern.weight,
          matchedSnippet: match[0]
        });
      }

      if (pattern.negativeContextRegex) {
        const negMatch = text.match(pattern.negativeContextRegex);
        if (negMatch) {
          detectedIntents.push({
            intent: pattern.intent,
            weight: pattern.weight + 2, // Fortemente indicativo de material/suprimento
            matchedSnippet: negMatch[0],
            isNegativeContext: true
          });
        }
      }

      if (pattern.pureSupplyRegex) {
        const pureMatch = text.match(pattern.pureSupplyRegex);
        if (pureMatch) {
          detectedIntents.push({
            intent: pattern.intent,
            weight: pattern.weight + 2,
            matchedSnippet: pureMatch[0],
            isPureSupply: true
          });
        }
      }
    }

    // Detecção de negação explícita de prestação de serviços (ex: "sem operador", "sem prestação de serviço", "sem mão de obra")
    const hasExplicitNoService = /\b(sem\s+(operador(es)?|prestacao\s+de\s+servicos?|equipe|mao\s+de\s+obra|instalacao))\b/i.test(text);

    // Se houver negação de serviço, remover falsos matches de SERVIÇO causados pelo trecho negado
    const filteredIntents = hasExplicitNoService
      ? detectedIntents.filter(d => d.intent !== ServiceIntent.SERVICO || !/prestacao\s+de\s+servico/i.test(d.matchedSnippet))
      : detectedIntents;

    // Se houver indicação explícita de "prestação de serviços", "operação continuada" ou "serviços técnicos" (sem negação)
    const hasExplicitServiceVerbs = !hasExplicitNoService && /\b(prestacao\s+de\s+servicos?|execucao\s+de\s+servicos?|servicos?\s+tecnicos?\s+de|operacao\s+(continuada|e\s+manutencao|de\s+ete|de\s+eta)|inspecao\s+de\s+seguranca|servicos?\s+de\s+amostragem)\b/i.test(text);
    // Se houver indicação explícita de "aquisição", "compra" ou "fornecimento puro"
    const hasExplicitSupply = /\b(aquisicao|compra|fornecimento\s+parcelado|suprimento|entrega\s+de\s+bens)\b/i.test(text);

    // Determinar intenção primária
    filteredIntents.sort((a, b) => b.weight - a.weight);

    let primaryIntent = ServiceIntent.SERVICO;
    let isSupplyOnly = false;
    let confidence = 'Média';
    let explanation = '';

    if (filteredIntents.length > 0) {
      primaryIntent = filteredIntents[0].intent;
      confidence = filteredIntents[0].weight >= 9 ? 'Alta' : 'Média';

      if (primaryIntent === ServiceIntent.FORNECIMENTO || primaryIntent === ServiceIntent.MATERIAL || (primaryIntent === ServiceIntent.LOCACAO && hasExplicitNoService)) {
        // Se também fala de prestação de serviços sem negação expressa
        if (hasExplicitServiceVerbs && !hasExplicitNoService) {
          isSupplyOnly = false;
          explanation = `Objeto misto: identificada intenção de ${primaryIntent} (${filteredIntents[0].matchedSnippet}), porém com componentes de serviço técnico associado.`;
        } else {
          isSupplyOnly = true;
          explanation = `Intenção pura de ${primaryIntent} (${filteredIntents[0].matchedSnippet})${hasExplicitNoService ? ' com exclusão expressa de prestação de serviços/mão de obra' : ''}. Não há menção à prestação contínua de serviço técnico.`;
        }
      } else {
        isSupplyOnly = false;
        explanation = `Intenção classificada como ${primaryIntent} através do sinal "${filteredIntents[0].matchedSnippet}". Escopo aderente ao perfil de serviços da Vellia.`;
      }
    } else {
      // Heurística de fallback
      if (hasExplicitSupply && !hasExplicitServiceVerbs) {
        primaryIntent = ServiceIntent.FORNECIMENTO;
        isSupplyOnly = true;
        confidence = 'Média';
        explanation = 'Detecção heurística de fornecimento/compra mercantil sem prestação de serviço técnico.';
      } else {
        primaryIntent = ServiceIntent.SERVICO;
        isSupplyOnly = false;
        confidence = 'Baixa';
        explanation = 'Sem padrões restritivos detectados; assumido escopo padrão de serviços.';
      }
    }

    return {
      primaryIntent,
      confidence,
      isSupplyOnly,
      isServiceIntended: !isSupplyOnly,
      evidence: detectedIntents.map(d => `${d.intent}: "${d.matchedSnippet}"`),
      explanation
    };
  }
}
