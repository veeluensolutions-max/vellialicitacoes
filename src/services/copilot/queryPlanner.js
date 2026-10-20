/**
 * VELLIA LICITAÇÕES — FASE 13: COPILOTO VELLIA
 * QueryPlanner: Interpretação de Intenção e Planejamento de Execução (Itens 5 e 52).
 * 
 * Regras:
 * - Identifica a intenção da pergunta do usuário.
 * - Extrai entidades (oportunidades específicas, empresa, serviço, prazo, local, concorrente).
 * - Define quais módulos e fontes do ecossistema precisam ser consultados.
 */

export const CopilotIntent = {
  OPPORTUNITY_SEARCH: 'OPPORTUNITY_SEARCH',
  OPPORTUNITY_COMPARE: 'OPPORTUNITY_COMPARE',
  DEADLINE_QUERY: 'DEADLINE_QUERY',
  DOCUMENT_QUERY: 'DOCUMENT_QUERY',
  CERTIFICATE_QUERY: 'CERTIFICATE_QUERY',
  TECHNICAL_CAPABILITY_QUERY: 'TECHNICAL_CAPABILITY_QUERY',
  PROPOSAL_QUERY: 'PROPOSAL_QUERY',
  PRICE_QUERY: 'PRICE_QUERY',
  RISK_QUERY: 'RISK_QUERY',
  GO_NOGO_QUERY: 'GO_NOGO_QUERY',
  COMPETITOR_QUERY: 'COMPETITOR_QUERY',
  RESULT_QUERY: 'RESULT_QUERY',
  PERFORMANCE_QUERY: 'PERFORMANCE_QUERY',
  BRIEFING_TODAY: 'BRIEFING_TODAY',
  EARLY_PROSPECTING_QUERY: 'EARLY_PROSPECTING_QUERY',
  CRM_RELATIONSHIP_QUERY: 'CRM_RELATIONSHIP_QUERY',
  COMMUNICATIONS_QUERY: 'COMMUNICATIONS_QUERY',
  PRODUCTIVITY_EMAIL_QUERY: 'PRODUCTIVITY_EMAIL_QUERY',
  PRODUCTIVITY_CALENDAR_QUERY: 'PRODUCTIVITY_CALENDAR_QUERY',
  EXECUTIVE_COMMAND_CENTER_QUERY: 'EXECUTIVE_COMMAND_CENTER_QUERY',
  GROWTH_EXPANSION_QUERY: 'GROWTH_EXPANSION_QUERY',
  PARTNER_STRATEGY_QUERY: 'PARTNER_STRATEGY_QUERY',
  TENDER_NETWORK_QUERY: 'TENDER_NETWORK_QUERY',
  OUTCOME_INTELLIGENCE_QUERY: 'OUTCOME_INTELLIGENCE_QUERY',
  PREDICTIVE_RISK_QUERY: 'PREDICTIVE_RISK_QUERY',
  PRESCRIPTIVE_MITIGATION_QUERY: 'PRESCRIPTIVE_MITIGATION_QUERY',
  PORTFOLIO_CAPACITY_QUERY: 'PORTFOLIO_CAPACITY_QUERY',
  CAPABILITY_INVESTMENT_QUERY: 'CAPABILITY_INVESTMENT_QUERY',
  GENERAL_ANALYTICS: 'GENERAL_ANALYTICS'
};

export class QueryPlanner {
  /**
   * Planeja a execução da consulta com base no texto e histórico recente
   */
  static plan(query = '', sessionContext = {}) {
    const q = query.toLowerCase().trim();
    const entities = this._extractEntities(query, sessionContext);
    const intent = this._detectIntent(q, entities);

    // Módulos requeridos com base na intenção
    const modules = this._determineRequiredModules(intent, entities);

    return {
      query,
      intent,
      entities,
      modules,
      executionSteps: this._buildExecutionSteps(intent, entities, modules)
    };
  }

  static _detectIntent(q, entities) {
    // FASE 69: Strategic Investment & Capability Expansion Planner (Itens 222 e 223)
    if (
      q.includes('qual capacidade deveríamos avaliar expandir') ||
      q.includes('qual capacidade deveriamos avaliar expandir') ||
      q.includes('vale mais comprar ou locar') ||
      q.includes('comprar ou locar') ||
      q.includes('quais gargalos são recorrentes') ||
      q.includes('quais gargalos sao recorrentes') ||
      q.includes('gargalos recorrentes') ||
      q.includes('qual investimento afeta mais') ||
      q.includes('afeta mais oportunidades qualificadas') ||
      q.includes('que capacidade precisamos para crescer') ||
      q.includes('expansão de capacidade') ||
      q.includes('expansao de capacidade') ||
      q.includes('capability investment') ||
      q.includes('capability expansion') ||
      q.includes('investment planner')
    ) {
      return CopilotIntent.CAPABILITY_INVESTMENT_QUERY;
    }

    // FASE 68: Strategic Resource Optimization + Portfolio Tradeoff Engine (Itens 219 a 222)
    if (
      q.includes('se ganharmos a e b') ||
      q.includes('se ganharmos') ||
      q.includes('conseguimos executar') ||
      q.includes('maior gargalo nos próximos') ||
      q.includes('maior gargalo nos proximos') ||
      q.includes('maior gargalo') ||
      q.includes('o que acontece se priorizarmos') ||
      q.includes('competem pela mesma equipe') ||
      q.includes('competem pelo mesmo') ||
      q.includes('permitiria perseguir as duas') ||
      q.includes('capacidade estratégica') ||
      q.includes('capacidade estrategica') ||
      q.includes('capacidade do portfólio') ||
      q.includes('capacidade do portfolio') ||
      q.includes('trade-off de capacidade')
    ) {
      return CopilotIntent.PORTFOLIO_CAPACITY_QUERY;
    }

    // FASE 67: Prescriptive Risk Mitigation + Recovery Planner (Itens 200 a 203)
    if (
      q.includes('como reduzimos esse risco') ||
      q.includes('como reduzimos') ||
      q.includes('qual ação tem maior impacto') ||
      q.includes('qual acao tem maior impacto') ||
      q.includes('ainda dá tempo de recuperar') ||
      q.includes('ainda da tempo de recuperar') ||
      q.includes('qual plano b existe') ||
      q.includes('plano b') ||
      q.includes('plano de contingência') ||
      q.includes('plano de contingencia') ||
      q.includes('confirmarmos o parceiro') ||
      q.includes('bloqueando o restante') ||
      q.includes('plano de mitigação') ||
      q.includes('plano de mitigacao') ||
      q.includes('recovery planner')
    ) {
      return CopilotIntent.PRESCRIPTIVE_MITIGATION_QUERY;
    }

    // FASE 66: Predictive Readiness + Risk Forecasting + Previsão Explicável de Risco Operacional (Itens 224 a 227)
    if (
      q.includes('risco de não ficarmos prontos') ||
      q.includes('risco de nao ficarmos prontos') ||
      q.includes('por que o risco aumentou') ||
      q.includes('pressionando o prazo') ||
      q.includes('reduziria o risco') ||
      q.includes('baseado em quantos casos') ||
      q.includes('risco preditivo') ||
      q.includes('predictive risk') ||
      q.includes('risco de não-submissão') ||
      q.includes('risco de nao-submissao') ||
      q.includes('alerta antecipado') ||
      q.includes('early warning')
    ) {
      return CopilotIntent.PREDICTIVE_RISK_QUERY;
    }

    // FASE 65: Outcome Intelligence & Aprendizado sobre Resultados (Itens 117 a 120)
    if (
      q.includes('por que estamos perdendo') ||
      q.includes('perdendo mais') ||
      q.includes('fatores aparecem com mais frequência') ||
      q.includes('fatores aparecem com mais frequencia') ||
      q.includes('frequência nos wins') ||
      q.includes('frequencia nos wins') ||
      q.includes('perdas foram por desclassificação') ||
      q.includes('perdas foram por desclassificacao') ||
      q.includes('ficaram prontas tarde demais') ||
      q.includes('prontas tarde demais') ||
      q.includes('outcome intelligence') ||
      q.includes('inteligência de resultados') ||
      q.includes('inteligencia de resultados') ||
      q.includes('disciplined loss') ||
      q.includes('win rate real')
    ) {
      return CopilotIntent.OUTCOME_INTELLIGENCE_QUERY;
    }

    // FASE 63: Tender Intelligence Network & Cobertura de Fontes (Itens 189 a 192)
    if (
      q.includes('fontes estão degradadas') ||
      q.includes('fontes estao degradadas') ||
      q.includes('fonte degradada') ||
      q.includes('mais oportunidades únicas') ||
      q.includes('mais oportunidades unicas') ||
      q.includes('oportunidades únicas') ||
      q.includes('lacunas de cobertura') ||
      q.includes('lacuna de cobertura') ||
      q.includes('esta oportunidade veio de quais fontes') ||
      q.includes('de quais fontes') ||
      q.includes('conflito entre fontes') ||
      q.includes('divergência entre fontes') ||
      q.includes('tender network') ||
      q.includes('rede de fontes')
    ) {
      return CopilotIntent.TENDER_NETWORK_QUERY;
    }

    // FASE 62: Partner & Consortium Intelligence (Itens 154 a 157)
    if (
      q.includes('participar sozinhos') ||
      q.includes('participar sozinho') ||
      q.includes('sozinhos') ||
      q.includes('exigiria parceiro') ||
      q.includes('exigiria parceiros') ||
      q.includes('consórcio é permitido') ||
      q.includes('consorcio e permitido') ||
      q.includes('consórcio permitido') ||
      q.includes('consorcio permitido') ||
      q.includes('parceiros cadastrados atendem') ||
      q.includes('quais parceiros atendem') ||
      q.includes('estratégia de parceria') ||
      q.includes('estrategia de parceria') ||
      q.includes('subcontratação é permitida') ||
      q.includes('subcontratacao e permitida') ||
      q.includes('impacto na margem se usarmos')
    ) {
      return CopilotIntent.PARTNER_STRATEGY_QUERY;
    }

    // FASE 61: Growth & Opportunity Expansion Engine (Itens 179 a 182)
    if (
      q.includes('crescimento') ||
      q.includes('potencial de crescimento') ||
      q.includes('cross-sell') ||
      q.includes('compradores deveríamos monitorar') ||
      q.includes('compradores deveriamos monitorar') ||
      q.includes('presença é baixa') ||
      q.includes('presenca e baixa') ||
      q.includes('falta capacidade') ||
      q.includes('mercado adjacente') ||
      q.includes('onde expandir') ||
      q.includes('white space')
    ) {
      return CopilotIntent.GROWTH_EXPANSION_QUERY;
    }

    // 0. Centro de Comando Executivo, Pipeline & Forecast (Fase 20 — Itens 67 a 70)
    if (
      q.includes('nosso pipeline') ||
      q.includes('como está o pipeline') ||
      q.includes('como esta o pipeline') ||
      q.includes('valor do pipeline') ||
      q.includes('bater a meta') ||
      q.includes('bater a nossa meta') ||
      q.includes('meta de contratos') ||
      q.includes('metas comerciais') ||
      q.includes('qual empresa está melhor') ||
      q.includes('qual empresa esta melhor') ||
      q.includes('empresa está melhor') ||
      q.includes('qual serviço tem maior potencial') ||
      q.includes('serviço tem maior potencial') ||
      q.includes('oportunidades estão em risco') ||
      q.includes('oportunidades estao em risco') ||
      q.includes('pipeline em risco') ||
      q.includes('quanto podemos fechar') ||
      q.includes('quanto podemos faturar') ||
      q.includes('quanto fecha este mês') ||
      q.includes('fechar este mês') ||
      q.includes('fechar este mes') ||
      q.includes('command center')
    ) {
      return CopilotIntent.EXECUTIVE_COMMAND_CENTER_QUERY;
    }

    // 1. Calendário e Reuniões Integradas (Fase 19)
    if (
      q.includes('reunião') ||
      q.includes('reuniao') ||
      q.includes('reuniões') ||
      q.includes('reunioes') ||
      q.includes('agenda hoje') ||
      q.includes('minha agenda') ||
      q.includes('conflito para') ||
      q.includes('existe conflito') ||
      q.includes('horário livre') ||
      q.includes('horario livre') ||
      q.includes('horários disponíveis') ||
      q.includes('agende uma reunião') ||
      q.includes('marcar reunião') ||
      q.includes('agendar reunião')
    ) {
      return CopilotIntent.PRODUCTIVITY_CALENDAR_QUERY;
    }

    // 2. E-mails e Respostas Integradas (Fase 19)
    if (
      q.includes('respondeu') ||
      q.includes('resposta recebida') ||
      q.includes('cliente respondeu') ||
      q.includes('contato respondeu') ||
      q.includes('e-mails relacionados') ||
      q.includes('emails relacionados') ||
      q.includes('e-mails da oportunidade') ||
      q.includes('emails da oportunidade') ||
      q.includes('e-mails sincronizados') ||
      q.includes('emails sincronizados') ||
      q.includes('caixa postal') ||
      q.includes('sem resposta há') ||
      q.includes('sem resposta ha')
    ) {
      return CopilotIntent.PRODUCTIVITY_EMAIL_QUERY;
    }

    if (q.includes('briefing') || q.includes('resumo do dia') || (q.includes('atenção hoje') && !q.includes('proposta'))) {
      return CopilotIntent.BRIEFING_TODAY;
    }

    if (
      q.includes('quem devo contatar') ||
      q.includes('com quem precisamos falar') ||
      q.includes('prepare um e-mail') ||
      q.includes('preparar e-mail') ||
      q.includes('prepare um email') ||
      q.includes('prepare uma mensagem') ||
      q.includes('qual mensagem') ||
      q.includes('que mensagem') ||
      q.includes('follow-up está atrasado') ||
      q.includes('followup está atrasado') ||
      q.includes('follow-ups atrasados') ||
      q.includes('depois da reunião') ||
      q.includes('pós-reunião') ||
      q.includes('crie um follow-up') ||
      q.includes('criar follow-up') ||
      q.includes('redigir') ||
      q.includes('caixa de saída') ||
      q.includes('campanha assistida')
    ) {
      return CopilotIntent.COMMUNICATIONS_QUERY;
    }

    if (
      q.includes('falar hoje') ||
      q.includes('com quem falar') ||
      q.includes('último contato com') ||
      q.includes('sem contato') ||
      q.includes('follow-up') ||
      q.includes('followup') ||
      q.includes('relacionamento com') ||
      q.includes('contato da') ||
      q.includes('quem é o contato')
    ) {
      return CopilotIntent.CRM_RELATIONSHIP_QUERY;
    }

    if (
      q.includes('provavelmente vai contratar') ||
      q.includes('vai contratar') ||
      q.includes('pca') ||
      q.includes('planejamento') ||
      q.includes('radar antecipado') ||
      q.includes('antes da publicação') ||
      q.includes('antes de sair') ||
      q.includes('abordar antes') ||
      q.includes('contratos a vencer') ||
      q.includes('contratos vencem') ||
      q.includes('prospecção antecipada') ||
      q.includes('oportunidade futura')
    ) {
      return CopilotIntent.EARLY_PROSPECTING_QUERY;
    }

    if (q.includes('compare') || q.includes('comparar') || q.includes('diferença entre')) {
      return CopilotIntent.OPPORTUNITY_COMPARE;
    }

    if (q.includes('vale a pena') || q.includes('participar') || q.includes('go') || q.includes('no-go') || q.includes('decision score')) {
      return CopilotIntent.GO_NOGO_QUERY;
    }

    if (q.includes('concorrente') || q.includes('head-to-head') || q.includes('enfrent') || q.includes('aparece mais') || entities.competitor) {
      return CopilotIntent.COMPETITOR_QUERY;
    }

    if (q.includes('preço') || q.includes('cobrar') || q.includes('custo') || q.includes('margem') || q.includes('benchmark')) {
      return CopilotIntent.PRICE_QUERY;
    }

    if (q.includes('risco') || q.includes('matriz de risco')) {
      return CopilotIntent.RISK_QUERY;
    }

    if (q.includes('proposta') || q.includes('tarefa') || q.includes('bloqueador') || q.includes('prontidão') || q.includes('readiness')) {
      return CopilotIntent.PROPOSAL_QUERY;
    }

    if (q.includes('atestad') || q.includes('art') || q.includes('cat') || q.includes('acervo')) {
      return CopilotIntent.CERTIFICATE_QUERY;
    }

    if (q.includes('document') || q.includes('certid') || q.includes('vencendo') || q.includes('venc')) {
      if (q.includes('licitaç') || q.includes('oportunidade') || q.includes('prazo')) {
        return CopilotIntent.DEADLINE_QUERY;
      }
      return CopilotIntent.DOCUMENT_QUERY;
    }

    if (q.includes('prazo') || q.includes('encerra') || q.includes('amanhã') || q.includes('semana') || q.includes('dias')) {
      return CopilotIntent.DEADLINE_QUERY;
    }

    if (q.includes('win rate') || q.includes('vitória') || q.includes('perdendo') || q.includes('perda') || q.includes('resultado') || q.includes('desempenho')) {
      return CopilotIntent.PERFORMANCE_QUERY;
    }

    if (q.includes('capacidade') || q.includes('equipe') || q.includes('equipamento') || q.includes('capability')) {
      return CopilotIntent.TECHNICAL_CAPABILITY_QUERY;
    }

    if (q.includes('oportunidade') || q.includes('licitaç') || q.includes('edital') || q.includes('petronect') || entities.service || entities.company) {
      return CopilotIntent.OPPORTUNITY_SEARCH;
    }

    return CopilotIntent.GENERAL_ANALYTICS;
  }

  static _extractEntities(query, sessionContext = {}) {
    const q = query.toLowerCase();

    // ID ou número de oportunidade mencionado
    const oppRegex = /\b(700\d{7}|\d{10})\b/;
    const oppMatch = query.match(oppRegex);
    let targetOpportunityId = oppMatch ? oppMatch[0] : null;

    // Herança de contexto de sessão ("E a segunda?", "E o prazo dela?")
    if (!targetOpportunityId && (q.includes('dela') || q.includes('desta') || q.includes('dessa') || q.includes('segunda'))) {
      targetOpportunityId = sessionContext.lastDiscussedOpportunityId || null;
    }

    // Empresa
    let company = null;
    if (q.includes('excelência') || q.includes('excelencia')) company = 'Excelência Ambiental';
    else if (q.includes('veeluen') || q.includes('veluen')) company = 'Veeluen Solutions';

    // Serviço
    let service = null;
    if (q.includes('ete') || q.includes('efluente')) service = 'Operação de ETE';
    else if (q.includes('emiss') || q.includes('atmosf') || q.includes('isocinét')) service = 'Emissões Atmosféricas';
    else if (q.includes('nr-13') || q.includes('nr 13') || q.includes('caldeira')) service = 'NR-13';
    else if (q.includes('ruído') || q.includes('ruido') || q.includes('vibra')) service = 'Ruído Ambiental';
    else if (q.includes('resíduo') || q.includes('residuo')) service = 'Gestão de Resíduos';
    else if (q.includes('obra') || q.includes('civil')) service = 'Obras Civis';
    else {
      // Extração de serviço customizado após "de", "para", "sobre"
      const matchCustom = q.match(/(?:oportunidade|licita[çc][aã]o|servi[çc]o)\s+(?:de|para|sobre)\s+([a-z\s]+?)(?:\s+(?:em|para|no|na|com|\?|$))/i);
      if (matchCustom && matchCustom[1]) {
        const term = matchCustom[1].trim();
        if (!['hoje', 'amanha', 'esta', 'este', 'qualquer', 'boa'].includes(term)) {
          service = term;
        }
      }
    }

    // Portal / Origem Multifonte (Itens 51 e 52)
    let portal = null;
    if (q.includes('petronect')) portal = 'Petronect';
    else if (q.includes('pncp')) portal = 'PNCP';
    else if (q.includes('compras.gov') || q.includes('comprasgov') || q.includes('comprasnet')) portal = 'Compras.gov.br';
    else if (q.includes('mais de um portal') || q.includes('multiplos portais') || q.includes('ambos os portais') || q.includes('cross-source')) portal = 'MULTI_SOURCE';

    // Estado / Região
    let state = null;
    if (q.includes('pernambuco') || q.includes(' pe ') || q.endsWith(' pe') || q.includes('suape') || q.includes('rnest')) state = 'PE';
    else if (q.includes('bahia') || q.includes(' ba ') || q.endsWith(' ba') || q.includes('madre de deus')) state = 'BA';
    else if (q.includes('rio de janeiro') || q.includes(' rj ') || q.endsWith(' rj')) state = 'RJ';
    else if (q.includes('fernando de noronha')) state = 'Fernando de Noronha';

    // Concorrente
    let competitor = null;
    if (q.includes('ambiente & vida') || q.includes('ambiente e vida')) competitor = 'Ambiente & Vida';
    else if (q.includes('hidroeco') || q.includes('hidro eco')) competitor = 'HidroEco';
    else if (q.includes('ecotech') || q.includes('eco tech')) competitor = 'EcoTech Analítica';
    else if (q.includes('nordeste inspeções') || q.includes('nordeste inspecoes')) competitor = 'Nordeste Inspeções';

    // Prazos / Tempo (Apenas quando a query perguntar especificamente sobre encerramento)
    let maxDays = null;
    if (q.includes('vence hoje') || q.includes('encerra hoje') || q.includes('vencendo hoje') || q.includes('vence amanhã') || q.includes('vencendo amanhã')) {
      maxDays = 2;
    } else if (q.includes('encerra esta semana') || q.includes('vence esta semana') || q.includes('encerrando esta semana') || q.includes('em até 7 dias') || q.includes('próximos 7 dias')) {
      maxDays = 7;
    } else if (q.includes('encerra este mês') || q.includes('vence este mês')) {
      maxDays = 30;
    }

    // Score mínimo
    let minScore = null;
    if (q.includes('acima de 90') || q.includes('> 90')) minScore = 90;
    else if (q.includes('acima de 80') || q.includes('> 80')) minScore = 80;

    // Indicador ordinal ("segunda melhor", etc.)
    const isSecondBest = q.includes('segunda') || q.includes('2ª') || q.includes('2a');

    return {
      targetOpportunityId,
      company,
      service,
      portal,
      state,
      competitor,
      maxDays,
      minScore,
      isSecondBest
    };
  }

  static _determineRequiredModules(intent, entities) {
    const modules = new Set();

    switch (intent) {
      case CopilotIntent.CAPABILITY_INVESTMENT_QUERY:
        modules.add('CAPABILITY_INVESTMENT');
        modules.add('CAPACITY');
        modules.add('OPPORTUNITIES');
        modules.add('RESULTS');
        break;

      case CopilotIntent.BRIEFING_TODAY:
        modules.add('OPPORTUNITIES');
        modules.add('DECISION');
        modules.add('PROPOSALS');
        modules.add('DOCUMENTS');
        modules.add('RESULTS');
        modules.add('EARLY_RADAR');
        modules.add('COMMUNICATIONS');
        modules.add('PRODUCTIVITY');
        break;

      case CopilotIntent.PRODUCTIVITY_EMAIL_QUERY:
        modules.add('PRODUCTIVITY');
        modules.add('CRM');
        modules.add('OPPORTUNITIES');
        modules.add('COMMUNICATIONS');
        break;

      case CopilotIntent.PRODUCTIVITY_CALENDAR_QUERY:
        modules.add('PRODUCTIVITY');
        modules.add('CRM');
        modules.add('OPPORTUNITIES');
        break;

      case CopilotIntent.EXECUTIVE_COMMAND_CENTER_QUERY:
        modules.add('EXECUTIVE');
        modules.add('OPPORTUNITIES');
        modules.add('PROPOSALS');
        modules.add('RESULTS');
        break;

      case CopilotIntent.COMMUNICATIONS_QUERY:
        modules.add('COMMUNICATIONS');
        modules.add('CRM');
        modules.add('EARLY_RADAR');
        break;

      case CopilotIntent.EARLY_PROSPECTING_QUERY:
        modules.add('EARLY_RADAR');
        modules.add('OPPORTUNITIES');
        break;

      case CopilotIntent.CRM_RELATIONSHIP_QUERY:
        modules.add('CRM');
        modules.add('COMMUNICATIONS');
        modules.add('EARLY_RADAR');
        break;

      case CopilotIntent.GO_NOGO_QUERY:
      case CopilotIntent.OPPORTUNITY_COMPARE:
        modules.add('OPPORTUNITIES');
        modules.add('DECISION');
        modules.add('DOCUMENTS');
        modules.add('RESULTS');
        modules.add('EDITAL');
        break;

      case CopilotIntent.OPPORTUNITY_SEARCH:
      case CopilotIntent.DEADLINE_QUERY:
        modules.add('OPPORTUNITIES');
        modules.add('DECISION');
        break;

      case CopilotIntent.PROPOSAL_QUERY:
        modules.add('PROPOSALS');
        modules.add('DOCUMENTS');
        break;

      case CopilotIntent.DOCUMENT_QUERY:
      case CopilotIntent.CERTIFICATE_QUERY:
      case CopilotIntent.TECHNICAL_CAPABILITY_QUERY:
        modules.add('DOCUMENTS');
        modules.add('OPPORTUNITIES');
        break;

      case CopilotIntent.PRICE_QUERY:
      case CopilotIntent.COMPETITOR_QUERY:
      case CopilotIntent.PERFORMANCE_QUERY:
      case CopilotIntent.RESULT_QUERY:
        modules.add('RESULTS');
        modules.add('PROPOSALS');
        break;

      default:
        modules.add('OPPORTUNITIES');
        modules.add('DECISION');
        modules.add('RESULTS');
    }

    return Array.from(modules);
  }

  static _buildExecutionSteps(intent, entities, modules) {
    return [
      `Validar entidades da consulta (${JSON.stringify(entities)})`,
      `Recuperar dados seletivos dos módulos: [${modules.join(', ')}]`,
      'Aplicar filtros de segurança e permissão de usuário',
      'Construir contexto hierarquizado executivo',
      'Gerar resposta com distinção entre FATO, ESTIMATIVA e RECOMENDAÇÃO',
      'Mapear fontes internas oficiais e botões de atalho de ação'
    ];
  }
}

export default QueryPlanner;
