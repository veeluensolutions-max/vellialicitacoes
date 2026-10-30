/**
 * VELLIA LICITAÇÕES - SERVIÇO DE INTEGRAÇÃO OFICIAL PNCP EM TEMPO REAL
 * Portal Nacional de Contratações Públicas (Governo Federal)
 * 100% Dados Reais — Sem Mocks ou Dados Fictícios
 */

import { OpportunityService } from '../opportunityService.js';
import { analyzeOpportunityAdherence } from '../semanticEngine.js';
import { logService, LogType } from '../logService.js';

const PNCP_PROXY_BASE = '/api-pncp/v1';
const PNCP_DIRECT_BASE = 'https://pncp.gov.br/api/consulta/v1';
const PNCP_SEARCH_API = 'https://pncp.gov.br/api/search/';

// Termos reais dos serviços das 2 empresas para varredura em tempo real de editais abertos
export const REALTIME_SERVICE_SEARCH_QUERIES = [
  // Veeluen Solutions
  'tratamento de efluentes',
  'estacao de tratamento de esgoto',
  'estacao de tratamento de agua',
  'vasos de pressao',
  'caldeira',
  'SPDA',
  // Excelência Ambiental
  'emissoes atmosfericas',
  'monitoramento ambiental',
  'qualidade do ar',
  'licenciamento ambiental',
  'ruido ambiental',
  'amostragem isocinetica'
];

export class PncpService {
  /**
   * Helper para requisições na API Consulta v1
   */
  static async request(endpointPath, options = {}) {
    const isLocalhost = typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    const primaryUrl = isLocalhost
      ? `${PNCP_PROXY_BASE}${endpointPath}`
      : `${PNCP_DIRECT_BASE}${endpointPath}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 15000);

    try {
      const response = await fetch(primaryUrl, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          ...(options.headers || {})
        }
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Erro PNCP (${response.status}): ${response.statusText || 'Não encontrado'}`);
      }

      return await response.json();
    } catch (err) {
      clearTimeout(timeout);
      if (primaryUrl.startsWith('/api-pncp') && !options._retriedDirect) {
        const directUrl = `${PNCP_DIRECT_BASE}${endpointPath}`;
        const directResp = await fetch(directUrl, {
          ...options,
          headers: { 'Accept': 'application/json', ...(options.headers || {}) },
          _retriedDirect: true
        });
        if (directResp.ok) return await directResp.json();
      }
      throw err;
    }
  }

  /**
   * Busca editais reais abertos diretamente no motor de busca oficial do PNCP (CORS liberado *)
   * GET https://pncp.gov.br/api/search/?q=...&tipos_documento=edital&ordenacao=-data&pagina=1&tam_pagina=10&status=recebendo_proposta
   */
  static async searchRealOpenEditaisByQuery(query, { pagina = 1, tamPagina = 10, status = 'recebendo_proposta' } = {}) {
    const params = new URLSearchParams({
      q: query,
      tipos_documento: 'edital',
      ordenacao: '-data',
      pagina: String(pagina),
      tam_pagina: String(tamPagina)
    });
    if (status) {
      params.append('status', status);
    }

    const url = `${PNCP_SEARCH_API}?${params.toString()}`;

    let lastErr = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`Erro na API de Busca PNCP (${response.status})`);
        }

        const json = await response.json();
        return Array.isArray(json?.items) ? json.items : [];
      } catch (err) {
        clearTimeout(timeout);
        lastErr = err;
        await new Promise(r => setTimeout(r, 400 * attempt));
      }
    }
    throw lastErr || new Error('Falha na consulta ao PNCP');
  }

  /**
   * Converte um item real retornado por https://pncp.gov.br/api/search/ para o formato do Vellia
   */
  static mapSearchItemToRawOpportunity(item) {
    if (!item || item.cancelado === true) return null;

    const cnpj = String(item.orgao_cnpj || '').replace(/\D/g, '');
    const ano = String(item.ano || new Date().getFullYear());
    const seq = String(item.numero_sequencial || item.numero || '1');
    const numeroControle = item.numero_controle_pncp || `${cnpj}-1-${seq}/${ano}`;
    const numeroCurto = item.numero ? `${item.numero}/${ano}` : `PNCP-${ano}-${seq}`;

    const orgaoNome = (item.orgao_nome || 'Órgão Público').trim();
    const objeto = (item.description || item.title || '').trim();
    if (!objeto) return null;

    const linkOrigem = String(item.link_sistema_origem || '').trim();
    const linkOrigemLower = linkOrigem.toLowerCase();
    const orgaoUpper = orgaoNome.toUpperCase();
    const textoUpper = `${orgaoUpper} ${objeto.toUpperCase()}`;

    // Identifica o portal real da licitação (Nacional, Estatal, Plataforma Municipal ou Prefeitura)
    let portal = 'PNCP';
    const isMunicipal =
      item.esfera_id === 'M' ||
      orgaoUpper.includes('MUNICIPIO') ||
      orgaoUpper.includes('PREFEITURA') ||
      orgaoUpper.includes('SAAE') ||
      orgaoUpper.includes('SERVICO AUTONOMO DE AGUA') ||
      orgaoUpper.includes('SANEAR');

    if (
      orgaoUpper.includes('PETROBRAS') ||
      orgaoUpper.includes('PETROLEO BRASILEIRO') ||
      orgaoUpper.includes('TRANSPETRO') ||
      linkOrigemLower.includes('petronect') ||
      textoUpper.includes('PETRONECT')
    ) {
      portal = 'Petronect';
    } else if (linkOrigemLower.includes('portaldecompraspublicas')) {
      portal = 'Portal de Compras Públicas';
    } else if (linkOrigemLower.includes('bll') || linkOrigemLower.includes('licitanet') || linkOrigemLower.includes('bnc')) {
      portal = 'BLL / Licitanet / BNC';
    } else if (linkOrigemLower.includes('licitacoes-e')) {
      portal = 'Licitações-e (BB)';
    } else if (
      linkOrigemLower.includes('comprasnet') ||
      linkOrigemLower.includes('compras.gov') ||
      linkOrigemLower.includes('cnetmobile') ||
      linkOrigemLower.includes('serpro.gov.br')
    ) {
      portal = 'Compras.gov.br';
    } else if (isMunicipal) {
      portal = `Prefeitura — ${item.municipio_nome || orgaoNome}`;
    }

    const formatBrDate = (iso) => {
      if (!iso) return '';
      try {
        const d = new Date(iso);
        if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
      } catch { }
      return String(iso).slice(0, 10);
    };

    const pubDate = formatBrDate(item.data_publicacao_pncp || item.createdAt) || new Date().toLocaleDateString('pt-BR');
    const endDate = formatBrDate(item.data_fim_vigencia || item.data_inicio_vigencia) || pubDate;

    const cidade = item.municipio_nome || 'Nacional';
    const uf = item.uf || 'BR';
    const valorNum = Number(item.valor_global || item.valor_total_estimado || 0);
    const estimatedValue = valorNum > 0
      ? `R$ ${valorNum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : 'Ver no Edital Oficial';

    // Link oficial garantido no PNCP (onde constam todos os anexos e link do sistema de disputa)
    const pncpEditalUrl = cnpj && ano && seq
      ? `https://pncp.gov.br/app/editais/${cnpj}/${ano}/${seq}`
      : (item.item_url ? `https://pncp.gov.br/app/editais${item.item_url.replace('/compras', '')}` : 'https://pncp.gov.br/app/editais');

    const finalUrl = linkOrigem.startsWith('http') ? linkOrigem : pncpEditalUrl;

    return {
      id: `REAL-${numeroControle.replace(/[^a-zA-Z0-9-_]/g, '-')}`,
      number: numeroCurto,
      idPncp: numeroControle,
      portal,
      client: orgaoNome,
      title: `${item.title || `Edital ${numeroCurto}`} — ${orgaoNome}`,
      object: objeto,
      description: item.informacao_complementar ? `${objeto}\n\n${item.informacao_complementar}` : objeto,
      modality: item.modalidade_licitacao_nome || 'Pregão Eletrônico',
      contractType: 'Licitação Pública Oficial',
      situation: item.situacao_nome || 'Recebendo Propostas',
      publishDate: pubDate,
      endDate,
      city: cidade,
      state: uf,
      location: `${cidade} - ${uf}`,
      estimatedValue,
      url: finalUrl,
      pncpUrl: pncpEditalUrl,
      esfera: item.esfera_id || (isMunicipal ? 'M' : ''),
      isMunicipal,
      sourceOrigin: `${portal} (API Oficial em Tempo Real)`
    };
  }

  /**
   * Sincroniza em tempo real um Portal ou Prefeitura específica cadastrada no menu "Portais Conectados"
   */
  static async syncPortalOrPrefeituraRealTime(portalConfig) {
    const { opportunityRepository } = await import('../opportunityRepository.js');
    const seenIds = new Set();
    const matchedEditais = [];

    const cityOrFilter = (portalConfig?.searchFilter || portalConfig?.city || '').trim();
    const isSpecificCity =
      cityOrFilter &&
      !['BR', 'NACIONAL', 'TODOS OS MUNICÍPIOS BRASILEIROS', 'MUNICÍPIOS CONVENIADOS', 'MUNICIPIO', 'COMPRASNET', 'BLL', 'PORTALDECOMPRASPUBLICAS'].includes(cityOrFilter.toUpperCase());

    const serviceTerms = [
      'tratamento de efluentes',
      'estacao de tratamento de esgoto',
      'vasos de pressao',
      'monitoramento ambiental',
      'licenciamento ambiental',
      'emissoes atmosfericas'
    ];

    const queries = isSpecificCity
      ? serviceTerms.map(t => `${cityOrFilter} ${t}`)
      : REALTIME_SERVICE_SEARCH_QUERIES;

    for (const q of queries) {
      try {
        const items = await this.searchRealOpenEditaisByQuery(q, {
          pagina: 1,
          tamPagina: 8,
          status: 'recebendo_proposta'
        });

        for (const rawItem of items) {
          const mapped = this.mapSearchItemToRawOpportunity(rawItem);
          if (!mapped) continue;

          // Se for prefeitura específica com UF definida, valida UF/Município
          if (portalConfig?.uf && portalConfig.uf !== 'BR' && mapped.state && mapped.state !== portalConfig.uf) {
            continue;
          }

          const uniqueKey = mapped.idPncp || mapped.id;
          if (seenIds.has(uniqueKey)) continue;

          const analysis = analyzeOpportunityAdherence({
            title: mapped.title,
            object: mapped.object,
            description: mapped.description,
            location: mapped.location,
            daysLeft: 10
          });

          if (analysis.matchedKeywords && analysis.matchedKeywords.length > 0 && analysis.finalScore >= 40) {
            if (portalConfig?.category === 'PREFEITURA' && isSpecificCity) {
              mapped.portal = portalConfig.shortName || portalConfig.name;
            }
            seenIds.add(uniqueKey);
            matchedEditais.push(mapped);
          }
        }
        await new Promise(r => setTimeout(r, 350));
      } catch (err) {
        console.warn(`[PncpService] Aviso ao sincronizar portal "${portalConfig?.name}":`, err.message);
      }
    }

    const existingList = opportunityRepository.getAll();
    let addedCount = 0;

    for (const raw of matchedEditais) {
      const exists = existingList.some(e => e.id === raw.id || e.number === raw.number);
      if (!exists) {
        const enriched = OpportunityService.enrichOpportunity(raw, portalConfig?.name || 'Portal Conectado');
        if (enriched) {
          opportunityRepository.add(enriched);
          addedCount++;
        }
      }
    }

    return {
      scanned: matchedEditais.length,
      added: addedCount,
      items: matchedEditais
    };
  }

  /**
   * Varre em tempo real os editais abertos alinhados aos serviços da Veeluen Solutions e Excelência Ambiental
   */
  static async sweepCompanyServicesRealTime({ queries = REALTIME_SERVICE_SEARCH_QUERIES, maxPerQuery = 6 } = {}) {
    const seenIds = new Set();
    const matchedEditais = [];

    for (const q of queries) {
      try {
        const items = await this.searchRealOpenEditaisByQuery(q, {
          pagina: 1,
          tamPagina: maxPerQuery,
          status: 'recebendo_proposta'
        });

        for (const rawItem of items) {
          const mapped = this.mapSearchItemToRawOpportunity(rawItem);
          if (!mapped) continue;

          const uniqueKey = mapped.idPncp || mapped.id;
          if (seenIds.has(uniqueKey)) continue;

          // Verifica aderência real com os serviços das 2 empresas (Veeluen Solutions e Excelência Ambiental)
          const analysis = analyzeOpportunityAdherence({
            title: mapped.title,
            object: mapped.object,
            description: mapped.description,
            location: mapped.location,
            daysLeft: 10
          });

          // Mantém apenas editais que possuem termos reais dos serviços das duas empresas
          if (analysis.matchedKeywords && analysis.matchedKeywords.length > 0 && analysis.finalScore >= 40) {
            seenIds.add(uniqueKey);
            matchedEditais.push(mapped);
          }
        }

        // Pausa curta de 180ms entre buscas para respeitar rate-limit da API pública
        await new Promise(r => setTimeout(r, 180));
      } catch (err) {
        console.warn(`[PncpService] Aviso ao buscar termo "${q}":`, err.message);
      }
    }

    return matchedEditais;
  }

  // =========================================================================
  // 1. COMPRAS POR ÓRGÃO
  // =========================================================================

  static async getCompra(cnpj, ano, sequencial) {
    const cleanCnpj = String(cnpj).replace(/\D/g, '');
    if (!cleanCnpj) throw new Error('CNPJ inválido ou não informado.');
    if (!ano) throw new Error('Ano da compra é obrigatório.');
    if (!sequencial) throw new Error('Sequencial da compra é obrigatório.');

    const path = `/orgaos/${cleanCnpj}/compras/${ano}/${sequencial}`;
    logService.addLog(LogType.SYNC, `Consultando compra no PNCP: ${cleanCnpj}/${ano}/${sequencial}`, {
      path,
      portal: 'PNCP'
    });

    return await this.request(path);
  }

  // =========================================================================
  // 2. CONTRATAÇÕES ABERTAS & ATUALIZAÇÕES
  // =========================================================================

  static async getContratacoesProposta({ dataInicial, dataFinal, codigoModalidadeContratacao = '6', pagina = 1, tamanhoPagina = 10 }) {
    const params = new URLSearchParams();
    if (dataInicial) params.append('dataInicial', dataInicial.replace(/\D/g, ''));
    if (dataFinal) params.append('dataFinal', dataFinal.replace(/\D/g, ''));
    params.append('codigoModalidadeContratacao', String(codigoModalidadeContratacao || '6'));
    if (pagina) params.append('pagina', pagina);
    if (tamanhoPagina) params.append('tamanhoPagina', tamanhoPagina);

    const path = `/contratacoes/proposta?${params.toString()}`;
    logService.addLog(LogType.SYNC, `Consultando Contratações Abertas (Proposta) no PNCP`, { path, pagina });
    return await this.request(path);
  }

  static async getContratacoesAtualizacao({ dataInicial, dataFinal, codigoModalidadeContratacao = '6', pagina = 1, tamanhoPagina = 10 }) {
    const params = new URLSearchParams();
    if (dataInicial) params.append('dataInicial', dataInicial.replace(/\D/g, ''));
    if (dataFinal) params.append('dataFinal', dataFinal.replace(/\D/g, ''));
    params.append('codigoModalidadeContratacao', String(codigoModalidadeContratacao || '6'));
    if (pagina) params.append('pagina', pagina);
    if (tamanhoPagina) params.append('tamanhoPagina', tamanhoPagina);

    const path = `/contratacoes/atualizacao?${params.toString()}`;
    logService.addLog(LogType.SYNC, `Consultando Atualização de Contratações no PNCP`, { path, pagina });
    return await this.request(path);
  }

  // =========================================================================
  // 3. ATAS DE REGISTRO DE PREÇOS
  // =========================================================================

  static async getAtas({ dataInicial, dataFinal, pagina = 1, tamanhoPagina = 10 }) {
    const params = new URLSearchParams();
    if (dataInicial) params.append('dataInicial', dataInicial.replace(/\D/g, ''));
    if (dataFinal) params.append('dataFinal', dataFinal.replace(/\D/g, ''));
    if (pagina) params.append('pagina', pagina);
    if (tamanhoPagina) params.append('tamanhoPagina', tamanhoPagina);

    const path = `/atas?${params.toString()}`;
    return await this.request(path);
  }

  static async getAtasAtualizacao({ dataInicial, dataFinal, pagina = 1, tamanhoPagina = 10 }) {
    const params = new URLSearchParams();
    if (dataInicial) params.append('dataInicial', dataInicial.replace(/\D/g, ''));
    if (dataFinal) params.append('dataFinal', dataFinal.replace(/\D/g, ''));
    if (pagina) params.append('pagina', pagina);
    if (tamanhoPagina) params.append('tamanhoPagina', tamanhoPagina);

    const path = `/atas/atualizacao?${params.toString()}`;
    return await this.request(path);
  }

  // =========================================================================
  // 4. CONTRATOS PÚBLICOS CELEBRADOS
  // =========================================================================

  static async getContratos({ dataInicial, dataFinal, pagina = 1, tamanhoPagina = 10 }) {
    const params = new URLSearchParams();
    if (dataInicial) params.append('dataInicial', dataInicial.replace(/\D/g, ''));
    if (dataFinal) params.append('dataFinal', dataFinal.replace(/\D/g, ''));
    if (pagina) params.append('pagina', pagina);
    if (tamanhoPagina) params.append('tamanhoPagina', tamanhoPagina);

    const path = `/contratos?${params.toString()}`;
    return await this.request(path);
  }

  static async getContratosAtualizacao({ dataInicial, dataFinal, pagina = 1, tamanhoPagina = 10 }) {
    const params = new URLSearchParams();
    if (dataInicial) params.append('dataInicial', dataInicial.replace(/\D/g, ''));
    if (dataFinal) params.append('dataFinal', dataFinal.replace(/\D/g, ''));
    if (pagina) params.append('pagina', pagina);
    if (tamanhoPagina) params.append('tamanhoPagina', tamanhoPagina);

    const path = `/contratos/atualizacao?${params.toString()}`;
    return await this.request(path);
  }

  // =========================================================================
  // 5. PCA - PLANO DE CONTRATAÇÕES ANUAL
  // =========================================================================

  static async getPca({ ano = new Date().getFullYear(), pagina = 1, tamanhoPagina = 10, codigoUnidadeCompradora }) {
    const params = new URLSearchParams();
    if (ano) params.append('ano', ano);
    if (pagina) params.append('pagina', pagina);
    if (tamanhoPagina) params.append('tamanhoPagina', tamanhoPagina);
    if (codigoUnidadeCompradora) params.append('codigoUnidadeCompradora', codigoUnidadeCompradora);

    const path = `/pca/?${params.toString()}`;
    return await this.request(path);
  }

  static async getPcaAtualizacao({ dataInicial, dataFinal, pagina = 1, tamanhoPagina = 10 }) {
    const params = new URLSearchParams();
    if (dataInicial) params.append('dataInicial', dataInicial.replace(/\D/g, ''));
    if (dataFinal) params.append('dataFinal', dataFinal.replace(/\D/g, ''));
    if (pagina) params.append('pagina', pagina);
    if (tamanhoPagina) params.append('tamanhoPagina', tamanhoPagina);

    const path = `/pca/atualizacao?${params.toString()}`;
    return await this.request(path);
  }

  static async getPcaUsuario({ pagina = 1, tamanhoPagina = 10 }) {
    const params = new URLSearchParams();
    if (pagina) params.append('pagina', pagina);
    if (tamanhoPagina) params.append('tamanhoPagina', tamanhoPagina);

    const path = `/pca/usuario?${params.toString()}`;
    return await this.request(path);
  }

  // =========================================================================
  // NORMALIZADORES E MAPEAMENTO PARA O VELLIA LICITAÇÕES
  // =========================================================================

  static mapCompraToOpportunity(compra, customValues = {}) {
    if (!compra) return null;

    const numCompra = compra.numeroCompra || `${compra.sequencialCompra || '1'}/${compra.anoCompra || new Date().getFullYear()}`;
    const orgaoNome = compra.orgaoEntidade?.razaoSocial || compra.unidadeOrgao?.nomeUnidade || 'Órgão Público (PNCP)';
    const objeto = compra.objetoCompra || compra.informacaoComplementar || compra.objetoContratacao || '';
    if (!objeto) return null;

    const modalidade = compra.modalidadeNome || 'Pregão Eletrônico (PNCP)';
    const valorEstimado = compra.valorTotalEstimado || compra.valorTotalHomologado || null;

    const cidade = compra.unidadeOrgao?.municipioNome || 'Brasília';
    const estado = compra.unidadeOrgao?.ufSigla || 'DF';

    const dataPub = compra.dataPublicacaoPncp
      ? new Date(compra.dataPublicacaoPncp).toLocaleDateString('pt-BR')
      : new Date().toLocaleDateString('pt-BR');

    const dataFim = compra.dataEncerramentoProposta || compra.dataAberturaProposta || null;
    const dataFimFormatted = dataFim ? new Date(dataFim).toLocaleDateString('pt-BR') : dataPub;

    const cnpj = compra.orgaoEntidade?.cnpj || '';
    const ano = compra.anoCompra || new Date().getFullYear();
    const seq = compra.sequencialCompra || '';
    const pncpUrl = cnpj && seq ? `https://pncp.gov.br/app/editais/${cnpj}/${ano}/${seq}` : 'https://pncp.gov.br/app/editais';
    const urlOficial = compra.linkSistemaOrigem || pncpUrl;

    return {
      number: `PNCP-${ano}-${seq || numCompra}`,
      portal: 'PNCP',
      client: orgaoNome,
      title: objeto.length > 90 ? objeto.slice(0, 90) + '...' : objeto,
      object: objeto,
      description: compra.informacaoComplementar || objeto,
      modality: modalidade,
      contractType: 'Contratação Pública / PNCP',
      situation: compra.situacaoCompraNome || 'Recebendo Propostas',
      publishDate: dataPub,
      endDate: dataFimFormatted,
      state: estado,
      city: cidade,
      location: `${cidade} - ${estado}`,
      estimatedValue: valorEstimado
        ? `R$ ${Number(valorEstimado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : 'Ver no Edital Oficial',
      url: urlOficial,
      ...customValues
    };
  }

  static mapAtaToOpportunity(ata) {
    if (!ata) return null;
    const numAta = ata.numeroAtaRegistroPreco || ata.numeroControlePNCP || `ATA-${Date.now()}`;
    const orgaoNome = ata.orgaoEntidade?.razaoSocial || 'Órgão Gerenciador (PNCP)';
    const objeto = ata.objetoAta || 'Ata de Registro de Preços';
    const valor = ata.valorTotalHomologado || ata.valorTotalEstimado || null;

    const dataInicio = ata.dataVigenciaInicio
      ? new Date(ata.dataVigenciaInicio).toLocaleDateString('pt-BR')
      : new Date().toLocaleDateString('pt-BR');

    const dataFim = ata.dataVigenciaFim
      ? new Date(ata.dataVigenciaFim).toLocaleDateString('pt-BR')
      : dataInicio;

    return {
      number: `ARP-${ata.anoAta || new Date().getFullYear()}-${numAta}`,
      portal: 'PNCP (Atas)',
      client: orgaoNome,
      title: `[Ata de Preço] ${objeto.length > 80 ? objeto.slice(0, 80) + '...' : objeto}`,
      object: objeto,
      description: `Ata de Registro de Preços nº ${numAta}. Vigência: de ${dataInicio} até ${dataFim}. Controle PNCP: ${ata.numeroControlePNCP || 'N/A'}`,
      modality: 'Registro de Preços',
      contractType: 'Ata de Registro de Preços (ARP)',
      situation: 'Vigente / Homologada',
      publishDate: dataInicio,
      endDate: dataFim,
      state: 'DF',
      city: 'Nacional',
      location: 'Nacional / PNCP',
      estimatedValue: valor
        ? `R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : 'Valor Homologado em Ata',
      url: `https://pncp.gov.br/app/atas/${ata.numeroControlePNCP || ''}`
    };
  }

  static mapContratoToOpportunity(contrato) {
    if (!contrato) return null;
    const numContrato = contrato.numeroContratoEmpenho || contrato.numeroControlePNCP || `CTR-${Date.now()}`;
    const orgao = contrato.orgaoEntidade?.razaoSocial || 'Órgão Contratante (PNCP)';
    const fornecedor = contrato.fornecedor?.nomeRazaoSocialFornecedor || 'Fornecedor Contratado';
    const objeto = contrato.objetoContrato || 'Contrato Administrativo';
    const valor = contrato.valorInicial || contrato.valorGlobal || null;

    return {
      number: `CTR-${contrato.anoContrato || new Date().getFullYear()}-${numContrato}`,
      portal: 'PNCP (Contratos)',
      client: `${orgao} (Contratada: ${fornecedor})`,
      title: `[Contrato Celebrado] ${objeto.length > 80 ? objeto.slice(0, 80) + '...' : objeto}`,
      object: objeto,
      description: `Contrato nº ${numContrato}. Fornecedor: ${fornecedor}. Vigência: ${contrato.dataVigenciaInicio || 'N/A'} até ${contrato.dataVigenciaFim || 'N/A'}`,
      modality: 'Contrato Administrativo',
      contractType: 'Inteligência de Mercado / Benchmark',
      situation: 'Celebrado / Vigente',
      publishDate: contrato.dataPublicacaoPncp ? new Date(contrato.dataPublicacaoPncp).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
      endDate: contrato.dataVigenciaFim ? new Date(contrato.dataVigenciaFim).toLocaleDateString('pt-BR') : '',
      state: contrato.unidadeOrgao?.ufSigla || 'DF',
      city: contrato.unidadeOrgao?.municipioNome || 'Brasília',
      location: `${contrato.unidadeOrgao?.municipioNome || 'Nacional'} - ${contrato.unidadeOrgao?.ufSigla || 'DF'}`,
      estimatedValue: valor ? `R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Valor Contratado',
      url: `https://pncp.gov.br/app/contratos/${contrato.numeroControlePNCP || ''}`
    };
  }

  static mapPcaToRecord(pca) {
    if (!pca) return null;
    const orgao = pca.orgaoEntidade?.razaoSocial || pca.unidadeOrgao?.nomeUnidade || 'Órgão Federal';
    const descricaoItem = pca.descricaoItem || pca.objeto || 'Aquisição planejada no PCA';
    const previsao = pca.dataDesejada || pca.previsaoContratacao || 'Próximo Semestre';
    const valor = pca.valorTotalEstimado || pca.valorUnitarioEstimado || null;

    return {
      id: `PCA-PNCP-${pca.anoPca || new Date().getFullYear()}-${pca.sequencialItem || Date.now()}`,
      recordType: 'PLANNED_PURCHASE',
      portal: 'PNCP (PCA)',
      orgao,
      titulo: descricaoItem.length > 70 ? descricaoItem.slice(0, 70) + '...' : descricaoItem,
      objetoPlanejado: descricaoItem,
      previsaoLicitacao: previsao,
      valorEstimado: valor ? `R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Planejamento Orçamentário',
      estado: pca.unidadeOrgao?.ufSigla || 'DF',
      municipio: pca.unidadeOrgao?.municipioNome || 'Nacional',
      areaTecnica: 'Planejamento Antecipado (PCA)',
      natureza: `PCA ${pca.anoPca || new Date().getFullYear()} Aprovado`,
      status: 'PLANEJADA',
      alertaTipo: 'Oportunidade potencial futura'
    };
  }

  static importOpportunityToVellia(oppData) {
    return OpportunityService.createManual(oppData);
  }
}
