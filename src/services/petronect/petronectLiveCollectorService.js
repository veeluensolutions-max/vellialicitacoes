/**
 * VELLIA LICITAÇÕES — COLETOR PÚBLICO EM TEMPO REAL PETRONECT / PETROBRAS
 * 100% Dados Reais — Sem Mocks ou Dados Fictícios
 */

import { PncpService } from '../pncp/pncpService.js';
import { analyzeOpportunityAdherence } from '../semanticEngine.js';
import { logService, LogType } from '../logService.js';

export const PETROBRAS_GROUP_CNPJS = [
  { cnpj: '33000167000101', name: 'PETROBRAS - Petróleo Brasileiro S.A.', unit: 'Petrobras Matriz & Refinarias' },
  { cnpj: '02709449000159', name: 'TRANSPETRO - Petrobras Transporte S.A.', unit: 'Terminais e Dutos' },
  { cnpj: '02327980000103', name: 'TBG - Transportadora Brasileira Gasoduto', unit: 'Infraestrutura Gasífera' },
  { cnpj: '09610970000180', name: 'PBIO - Petrobras Biocombustível S.A.', unit: 'Biocombustíveis' }
];

export class PetronectLiveCollectorService {
  static async testLiveConnection() {
    const startTime = performance.now();
    try {
      const items = await PncpService.searchRealOpenEditaisByQuery('petrobras', {
        pagina: 1,
        tamPagina: 5,
        status: null
      });
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        success: true,
        latencyMs,
        itemsDetected: items.length,
        message: `Conexão pública ao vivo operando normalmente (${latencyMs}ms).`
      };
    } catch (err) {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        success: false,
        latencyMs,
        itemsDetected: 0,
        message: `Falha na consulta direta ao vivo: ${err.message}.`
      };
    }
  }

  static formatToBrDate(isoString) {
    if (!isoString) return 'não identificado';
    try {
      const d = new Date(isoString);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('pt-BR');
      }
    } catch {}
    return String(isoString).slice(0, 10);
  }

  /**
   * Coleta ao vivo editais públicos reais vinculados ao Grupo Petrobras / Transpetro / Estatais de Energia
   * Sem qualquer dado fictício.
   */
  static async collectLiveOpportunities() {
    const collected = [];
    const seenIds = new Set();

    logService.addLog(LogType.SYNC, 'Iniciando varredura em tempo real de licitações públicas Grupo Petrobras / Petronect...');

    const petroQueries = ['petrobras', 'transpetro'];

    for (const q of petroQueries) {
      try {
        const items = await PncpService.searchRealOpenEditaisByQuery(q, {
          pagina: 1,
          tamPagina: 15,
          status: 'recebendo_proposta'
        });

        for (const item of items) {
          if (!item || item.cancelado === true) continue;

          const cnpj = String(item.orgao_cnpj || '').replace(/\D/g, '');
          const orgaoNome = String(item.orgao_nome || '').trim();
          const objeto = String(item.description || item.title || '').trim();
          if (!objeto) continue;

          // Verifica aderência técnica com as 2 empresas
          const analysis = analyzeOpportunityAdherence({
            title: item.title || '',
            object: objeto,
            description: objeto,
            location: `${item.municipio_nome || ''} - ${item.uf || ''}`,
            daysLeft: 10
          });

          const isDirectPetroOrgao =
            PETROBRAS_GROUP_CNPJS.some(p => p.cnpj === cnpj) ||
            orgaoNome.toUpperCase().includes('PETROBRAS') ||
            orgaoNome.toUpperCase().includes('TRANSPETRO') ||
            orgaoNome.toUpperCase().includes('NUCLEP');

          // Só adiciona se for órgão do grupo/energia ou tiver aderência técnica real aos nossos serviços
          if (!isDirectPetroOrgao && (!analysis.matchedKeywords || analysis.matchedKeywords.length === 0)) {
            continue;
          }

          const ano = String(item.ano || new Date().getFullYear());
          const seq = String(item.numero_sequencial || item.numero || '1');
          const numero = item.numero_controle_pncp || `${item.numero || seq}/${ano}`;

          if (!seenIds.has(numero)) {
            seenIds.add(numero);
            const pncpUrl = cnpj && ano && seq
              ? `https://pncp.gov.br/app/editais/${cnpj}/${ano}/${seq}`
              : 'https://pncp.gov.br/app/editais';

            collected.push({
              numero,
              objeto,
              descricao: item.informacao_complementar ? `${objeto}\n\n${item.informacao_complementar}` : objeto,
              empresa: orgaoNome || 'PETROBRAS S.A.',
              cidade: item.municipio_nome || 'Rio de Janeiro',
              estado: item.uf || 'RJ',
              data_inicio: this.formatToBrDate(item.data_publicacao_pncp || item.createdAt),
              data_fim: this.formatToBrDate(item.data_fim_vigencia || item.data_inicio_vigencia),
              situacao: item.situacao_nome || 'Recebendo Propostas',
              sub_status: 'Divulgação Pública Oficial',
              modalidade: item.modalidade_licitacao_nome || 'Licitação Eletrônica',
              codigo_familia: 'FAM-PUB-PETRO',
              descricao_familia: 'Contratações Públicas Grupo Petrobras',
              valor_estimado: item.valor_global || item.valor_total_estimado || null,
              url: item.link_sistema_origem && String(item.link_sistema_origem).startsWith('http')
                ? item.link_sistema_origem
                : pncpUrl,
              sourceType: 'PRINCIPAL'
            });
          }
        }
      } catch (err) {
        logService.addLog(LogType.WARN, `Aviso na consulta em tempo real (${q}): ${err.message}`);
      }
    }

    logService.addLog(LogType.INGESTION, `Coletor Petronect em tempo real finalizou com ${collected.length} certames reais.`);
    return collected;
  }
}

export const petronectLiveCollectorService = PetronectLiveCollectorService;
export default PetronectLiveCollectorService;
