/**
 * VELLIA LICITAÇÕES - SERVIÇO DE INTEGRAÇÃO OFICIAL PNCP
 * Portal Nacional de Contratações Públicas (Governo Federal)
 * 
 * Endpoints Oficiais Mapeados:
 * - GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}
 * - GET /v1/atas
 * - GET /v1/atas/atualizacao
 * - GET /v1/contratacoes/proposta
 * - GET /v1/contratacoes/atualizacao
 * - GET /v1/contratos
 * - GET /v1/contratos/atualizacao
 * - GET /v1/pca/
 * - GET /v1/pca/atualizacao
 * - GET /v1/pca/usuario
 */

import { OpportunityService } from '../opportunityService.js';
import { logService, LogType } from '../logService.js';

// Base URL: prioriza rota proxy do Vite para evitar problemas de CORS no navegador
const PNCP_PROXY_BASE = '/api-pncp/v1';
const PNCP_DIRECT_BASE = 'https://pncp.gov.br/api/consulta/v1';

export class PncpService {
  /**
   * Helper para requisições com timeout e fallback
   */
  static async request(endpointPath, options = {}) {
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    // Em dev local usamos o proxy configurado no vite.config.js
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
      // Se falhou no proxy ou rede, tenta a url direta caso ainda não tenha tentado
      if (primaryUrl.startsWith('/api-pncp') && !options._retriedDirect) {
        try {
          const directUrl = `${PNCP_DIRECT_BASE}${endpointPath}`;
          const directResp = await fetch(directUrl, {
            ...options,
            headers: { 'Accept': 'application/json', ...(options.headers || {}) },
            _retriedDirect: true
          });
          if (directResp.ok) return await directResp.json();
        } catch {
          // ignora fallback silencioso
        }
      }
      throw err;
    }
  }

  // =========================================================================
  // 1. COMPRAS POR ÓRGÃO
  // =========================================================================

  /**
   * Consulta uma Compra / Licitação Específica
   * GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}
   */
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

  /**
   * Consulta contratações abertas para recebimento de proposta
   * GET /v1/contratacoes/proposta?dataInicial={AAAAMMDD}&dataFinal={AAAAMMDD}&codigoModalidadeContratacao={}&pagina={}
   */
  static async getContratacoesProposta({ dataInicial, dataFinal, codigoModalidadeContratacao, pagina = 1, tamanhoPagina = 10 }) {
    const params = new URLSearchParams();
    if (dataInicial) params.append('dataInicial', dataInicial.replace(/\D/g, ''));
    if (dataFinal) params.append('dataFinal', dataFinal.replace(/\D/g, ''));
    if (codigoModalidadeContratacao) params.append('codigoModalidadeContratacao', codigoModalidadeContratacao);
    if (pagina) params.append('pagina', pagina);
    if (tamanhoPagina) params.append('tamanhoPagina', tamanhoPagina);

    const path = `/contratacoes/proposta?${params.toString()}`;
    logService.addLog(LogType.SYNC, `Consultando Contratações Abertas (Proposta) no PNCP`, { path, pagina });
    return await this.request(path);
  }

  /**
   * Consulta atualizações incrementais de contratações
   * GET /v1/contratacoes/atualizacao?dataInicial={AAAAMMDD}&dataFinal={AAAAMMDD}&pagina={}
   */
  static async getContratacoesAtualizacao({ dataInicial, dataFinal, pagina = 1, tamanhoPagina = 10 }) {
    const params = new URLSearchParams();
    if (dataInicial) params.append('dataInicial', dataInicial.replace(/\D/g, ''));
    if (dataFinal) params.append('dataFinal', dataFinal.replace(/\D/g, ''));
    if (pagina) params.append('pagina', pagina);
    if (tamanhoPagina) params.append('tamanhoPagina', tamanhoPagina);

    const path = `/contratacoes/atualizacao?${params.toString()}`;
    logService.addLog(LogType.SYNC, `Consultando Atualização de Contratações no PNCP`, { path, pagina });
    return await this.request(path);
  }

  // =========================================================================
  // 3. ATAS DE REGISTRO DE PREÇOS
  // =========================================================================

  /**
   * Consulta Atas de Registro de Preços Vigentes
   * GET /v1/atas?dataInicial={AAAAMMDD}&dataFinal={AAAAMMDD}&pagina={n}
   */
  static async getAtas({ dataInicial, dataFinal, pagina = 1, tamanhoPagina = 10 }) {
    const params = new URLSearchParams();
    if (dataInicial) params.append('dataInicial', dataInicial.replace(/\D/g, ''));
    if (dataFinal) params.append('dataFinal', dataFinal.replace(/\D/g, ''));
    if (pagina) params.append('pagina', pagina);
    if (tamanhoPagina) params.append('tamanhoPagina', tamanhoPagina);

    const path = `/atas?${params.toString()}`;
    logService.addLog(LogType.SYNC, `Buscando Atas no PNCP: período ${dataInicial} a ${dataFinal}`, { path, pagina });
    return await this.request(path);
  }

  /**
   * Consulta Atualização Incremental de Atas
   * GET /v1/atas/atualizacao?dataInicial={AAAAMMDD}&dataFinal={AAAAMMDD}&pagina={n}
   */
  static async getAtasAtualizacao({ dataInicial, dataFinal, pagina = 1, tamanhoPagina = 10 }) {
    const params = new URLSearchParams();
    if (dataInicial) params.append('dataInicial', dataInicial.replace(/\D/g, ''));
    if (dataFinal) params.append('dataFinal', dataFinal.replace(/\D/g, ''));
    if (pagina) params.append('pagina', pagina);
    if (tamanhoPagina) params.append('tamanhoPagina', tamanhoPagina);

    const path = `/atas/atualizacao?${params.toString()}`;
    logService.addLog(LogType.SYNC, `Consultando Atualização de Atas no PNCP`, { path, pagina });
    return await this.request(path);
  }

  // =========================================================================
  // 4. CONTRATOS PÚBLICOS CELEBRADOS
  // =========================================================================

  /**
   * Consulta contratos vigentes celebrados
   * GET /v1/contratos?dataInicial={AAAAMMDD}&dataFinal={AAAAMMDD}&pagina={n}
   */
  static async getContratos({ dataInicial, dataFinal, pagina = 1, tamanhoPagina = 10 }) {
    const params = new URLSearchParams();
    if (dataInicial) params.append('dataInicial', dataInicial.replace(/\D/g, ''));
    if (dataFinal) params.append('dataFinal', dataFinal.replace(/\D/g, ''));
    if (pagina) params.append('pagina', pagina);
    if (tamanhoPagina) params.append('tamanhoPagina', tamanhoPagina);

    const path = `/contratos?${params.toString()}`;
    logService.addLog(LogType.SYNC, `Consultando Contratos no PNCP`, { path, pagina });
    return await this.request(path);
  }

  /**
   * Consulta atualização de contratos
   * GET /v1/contratos/atualizacao?dataInicial={AAAAMMDD}&dataFinal={AAAAMMDD}&pagina={n}
   */
  static async getContratosAtualizacao({ dataInicial, dataFinal, pagina = 1, tamanhoPagina = 10 }) {
    const params = new URLSearchParams();
    if (dataInicial) params.append('dataInicial', dataInicial.replace(/\D/g, ''));
    if (dataFinal) params.append('dataFinal', dataFinal.replace(/\D/g, ''));
    if (pagina) params.append('pagina', pagina);
    if (tamanhoPagina) params.append('tamanhoPagina', tamanhoPagina);

    const path = `/contratos/atualizacao?${params.toString()}`;
    logService.addLog(LogType.SYNC, `Consultando Atualização de Contratos no PNCP`, { path, pagina });
    return await this.request(path);
  }

  // =========================================================================
  // 5. PCA - PLANO DE CONTRATAÇÕES ANUAL (RADAR ANTECIPADO)
  // =========================================================================

  /**
   * Consulta geral ao Plano de Contratações Anual
   * GET /v1/pca/?ano={}&pagina={}&tamanhoPagina={}
   */
  static async getPca({ ano = new Date().getFullYear(), pagina = 1, tamanhoPagina = 10, codigoUnidadeCompradora }) {
    const params = new URLSearchParams();
    if (ano) params.append('ano', ano);
    if (pagina) params.append('pagina', pagina);
    if (tamanhoPagina) params.append('tamanhoPagina', tamanhoPagina);
    if (codigoUnidadeCompradora) params.append('codigoUnidadeCompradora', codigoUnidadeCompradora);

    const path = `/pca/?${params.toString()}`;
    logService.addLog(LogType.SYNC, `Consultando PCA (Plano de Contratações Anual) no PNCP para ano ${ano}`, { path, pagina });
    return await this.request(path);
  }

  /**
   * Consulta atualizações do Plano de Contratações Anual
   * GET /v1/pca/atualizacao?dataInicial={}&dataFinal={}&pagina={}
   */
  static async getPcaAtualizacao({ dataInicial, dataFinal, pagina = 1, tamanhoPagina = 10 }) {
    const params = new URLSearchParams();
    if (dataInicial) params.append('dataInicial', dataInicial.replace(/\D/g, ''));
    if (dataFinal) params.append('dataFinal', dataFinal.replace(/\D/g, ''));
    if (pagina) params.append('pagina', pagina);
    if (tamanhoPagina) params.append('tamanhoPagina', tamanhoPagina);

    const path = `/pca/atualizacao?${params.toString()}`;
    logService.addLog(LogType.SYNC, `Consultando Atualizações do PCA no PNCP`, { path, pagina });
    return await this.request(path);
  }

  /**
   * Consulta PCA vinculado a usuário
   * GET /v1/pca/usuario?pagina={}&tamanhoPagina={}
   */
  static async getPcaUsuario({ pagina = 1, tamanhoPagina = 10 }) {
    const params = new URLSearchParams();
    if (pagina) params.append('pagina', pagina);
    if (tamanhoPagina) params.append('tamanhoPagina', tamanhoPagina);

    const path = `/pca/usuario?${params.toString()}`;
    logService.addLog(LogType.SYNC, `Consultando PCA por Usuário no PNCP`, { path, pagina });
    return await this.request(path);
  }

  // =========================================================================
  // NORMALIZADORES E MAPEAMENTO PARA O VELLIA LICITAÇÕES
  // =========================================================================

  /**
   * Normaliza um retorno de Compra ou Contratação Aberta do PNCP
   */
  static mapCompraToOpportunity(compra, customValues = {}) {
    if (!compra) return null;

    const numCompra = compra.numeroCompra || `${compra.sequencialCompra || '1'}/${compra.anoCompra || new Date().getFullYear()}`;
    const orgaoNome = compra.orgaoEntidade?.razaoSocial || compra.unidadeOrgao?.nomeUnidade || 'Órgão Público Federal (PNCP)';
    const objeto = compra.objetoCompra || compra.informacaoComplementar || compra.objetoContratacao || 'Contratação via Portal Nacional de Contratações Públicas';
    const modalidade = compra.modalidadeNome || 'Pregão Eletrônico (PNCP)';
    const valorEstimado = compra.valorTotalEstimado || compra.valorTotalHomologado || null;

    const cidade = compra.unidadeOrgao?.municipioNome || 'Brasília';
    const estado = compra.unidadeOrgao?.ufSigla || 'DF';

    const dataPub = compra.dataPublicacaoPncp 
      ? new Date(compra.dataPublicacaoPncp).toLocaleDateString('pt-BR') 
      : new Date().toLocaleDateString('pt-BR');

    const dataFim = compra.dataEncerramentoProposta || compra.dataAberturaProposta || null;
    const dataFimFormatted = dataFim ? new Date(dataFim).toLocaleDateString('pt-BR') : '20/10/2026';

    const urlOficial = compra.linkSistemaOrigem || `https://pncp.gov.br/app/editais/${compra.orgaoEntidade?.cnpj || ''}/${compra.anoCompra || ''}/${compra.sequencialCompra || ''}`;

    return {
      number: `PNCP-${compra.anoCompra || new Date().getFullYear()}-${compra.sequencialCompra || numCompra}`,
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
        : 'Sob consulta',
      url: urlOficial,
      ...customValues
    };
  }

  /**
   * Normaliza um retorno de Ata do PNCP para o schema do Vellia
   */
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
      : '31/12/2026';

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

  /**
   * Normaliza um Contrato formalizado do PNCP
   */
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
      endDate: contrato.dataVigenciaFim ? new Date(contrato.dataVigenciaFim).toLocaleDateString('pt-BR') : '31/12/2026',
      state: contrato.unidadeOrgao?.ufSigla || 'DF',
      city: contrato.unidadeOrgao?.municipioNome || 'Brasília',
      location: `${contrato.unidadeOrgao?.municipioNome || 'Nacional'} - ${contrato.unidadeOrgao?.ufSigla || 'DF'}`,
      estimatedValue: valor ? `R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Valor Contratado',
      url: `https://pncp.gov.br/app/contratos/${contrato.numeroControlePNCP || ''}`
    };
  }

  /**
   * Normaliza um item do PCA para o Radar Antecipado
   */
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

  /**
   * Salva a oportunidade diretamente no Vellia e roda o motor semântico
   */
  static importOpportunityToVellia(oppData) {
    return OpportunityService.createManual(oppData);
  }
}
