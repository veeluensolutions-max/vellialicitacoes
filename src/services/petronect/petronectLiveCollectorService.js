/**
 * VELLIA LICITAÇÕES — COLETOR PÚBLICO EM TEMPO REAL PETRONECT / PETROBRAS
 * Conector de dados públicos e abertos para contratações do Grupo Petrobras.
 * 
 * Fontes Oficiais Integradas (Sem necessidade de login ou credenciais):
 * 1. Portal PNCP (Contratações públicas de estatais regidas pelas Leis 13.303/16 e 14.133/21):
 *    - CNPJ Petrobras Matriz: 33.000.167/0001-01 (33000167000101)
 *    - CNPJ Transpetro: 02.709.449/0001-59 (02709449000159)
 *    - CNPJ TBG (Transportadora Brasileira Gasoduto): 02.327.980/0001-03
 *    - CNPJ PBIO (Petrobras Biocombustível): 09.610.970/0001-80
 * 2. Feed Estruturado de Oportunidades Públicas Petronect (PETRONECT_PUBLIC_FEED)
 * 3. Sanitização e normalização imediata para o padrão PetronectDTO
 */

import { PETRONECT_CONFIG } from './petronectConfig.js';
import { PETRONECT_PUBLIC_FEED } from './petronectConnector.js';
import { PncpService } from '../pncp/pncpService.js';
import { logService, LogType } from '../logService.js';

// Lista oficial de CNPJs de unidades do Grupo Petrobras
export const PETROBRAS_GROUP_CNPJS = [
  { cnpj: '33000167000101', name: 'PETROBRAS - Petróleo Brasileiro S.A.', unit: 'Petrobras Matriz & Refinarias' },
  { cnpj: '02709449000159', name: 'TRANSPETRO - Petrobras Transporte S.A.', unit: 'Terminais e Dutos' },
  { cnpj: '02327980000103', name: 'TBG - Transportadora Brasileira Gasoduto', unit: 'Infraestrutura Gasífera' },
  { cnpj: '09610970000180', name: 'PBIO - Petrobras Biocombustível S.A.', unit: 'Biocombustíveis' }
];

export class PetronectLiveCollectorService {
  /**
   * Realiza teste de conexão / health check ativo
   */
  static async testLiveConnection() {
    const startTime = performance.now();
    try {
      // Teste rápido consultando contratações públicas abertas recentes do grupo
      const now = new Date();
      const past3Days = new Date(now.getTime() - 3 * 86400000);
      const dataInicial = this.formatDateYMD(past3Days);
      const dataFinal = this.formatDateYMD(now);

      const resp = await PncpService.getContratacoesProposta({
        dataInicial,
        dataFinal,
        pagina: 1,
        tamanhoPagina: 5
      });

      const latencyMs = Math.round(performance.now() - startTime);
      return {
        success: true,
        latencyMs,
        itemsDetected: Array.isArray(resp) ? resp.length : (resp?.data?.length || 0),
        message: `Conexão pública ao vivo operando normalmente (${latencyMs}ms).`
      };
    } catch (err) {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        success: false,
        latencyMs,
        itemsDetected: 0,
        message: `Falha na consulta direta ao vivo: ${err.message}. Modo fallback ativado.`
      };
    }
  }

  /**
   * Formata datas para o padrão YYYYMMDD
   */
  static formatDateYMD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  }

  /**
   * Converte data ISO ou YYYY-MM-DD para DD/MM/YYYY
   */
  static formatToBrDate(isoString) {
    if (!isoString) return 'não identificado';
    try {
      const d = new Date(isoString);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('pt-BR');
      }
    } catch {
      // Fallback
    }
    return String(isoString).slice(0, 10);
  }

  /**
   * Coleta ao vivo todas as oportunidades públicas abertas do Grupo Petrobras
   * e mescla com os editais estratégicos do Petronect.
   */
  static async collectLiveOpportunities() {
    const collected = [];
    const seenIds = new Set();

    logService.addLog(LogType.SYNC, 'Iniciando varredura ao vivo da área pública de licitações Petronect / Grupo Petrobras...');

    // 1. TENTA COLETAR CERTAMES OFICIAIS AO VIVO VIA DADOS ABERTOS DO GOVERNO / PNCP
    try {
      const now = new Date();
      const past15Days = new Date(now.getTime() - 15 * 86400000);
      const dataInicial = this.formatDateYMD(past15Days);
      const dataFinal = this.formatDateYMD(now);

      // Consulta oportunidades abertas
      const liveData = await PncpService.getContratacoesProposta({
        dataInicial,
        dataFinal,
        pagina: 1,
        tamanhoPagina: 30
      });

      const items = Array.isArray(liveData) 
        ? liveData 
        : (liveData?.data || liveData?.resultado || []);

      if (items && items.length > 0) {
        for (const item of items) {
          const orgaoCnpj = String(item.orgaoEntidade?.cnpj || item.cnpjOrgao || '').replace(/\D/g, '');
          const orgaoNome = String(item.orgaoEntidade?.razaoSocial || item.nomeOrgao || '').toUpperCase();
          const objeto = String(item.objetoCompra || item.objeto || '').trim();

          // Filtra certames vinculados ao Grupo Petrobras, Transpetro, refinarias ou correlatos de óleo, gás e energia
          const isPetrobrasGroup = 
            PETROBRAS_GROUP_CNPJS.some(p => p.cnpj === orgaoCnpj) ||
            orgaoNome.includes('PETROBRAS') ||
            orgaoNome.includes('PETROLEO BRASILEIRO') ||
            orgaoNome.includes('TRANSPETRO') ||
            orgaoNome.includes('RNEST') ||
            orgaoNome.includes('REGAP') ||
            orgaoNome.includes('REPLAN');

          if (isPetrobrasGroup && objeto) {
            const numero = String(item.numeroContratacao || item.sequencialCompra || `7004${item.numeroCompra || Date.now()}`);
            if (!seenIds.has(numero)) {
              seenIds.add(numero);

              collected.push({
                numero,
                objeto: objeto,
                descricao: item.informacaoComplementar || objeto,
                empresa: item.orgaoEntidade?.razaoSocial || 'PETROBRAS S.A.',
                cidade: item.unidadeOrgao?.municipioNome || 'Rio de Janeiro',
                estado: item.unidadeOrgao?.ufSigla || 'RJ',
                data_inicio: this.formatToBrDate(item.dataAberturaProposta || item.dataPublicacaoPncp),
                data_fim: this.formatToBrDate(item.dataEncerramentoProposta || item.dataHoraPrevisaoAbertura),
                situacao: item.situacaoCompraNome || 'Aberto para propostas',
                sub_status: 'Divulgação Pública Oficial',
                modalidade: item.modalidadeNome || 'Licitação Eletrônica Lei 13.303',
                codigo_familia: 'FAM-PUB-PETRO',
                descricao_familia: 'Contratações Públicas Grupo Petrobras',
                valor_estimado: item.valorTotalEstimado || item.valorTotalHomologado || null,
                url: item.linkSistemaOrigem || `https://www.petronect.com.br/portalpublico/${numero}`,
                sourceType: 'PRINCIPAL'
              });
            }
          }
        }
      }
    } catch (apiErr) {
      logService.addLog(LogType.WARN, `Coleta direta da API pública retornou aviso: ${apiErr.message}. Mantendo catálogo ativo com fallback.`);
    }

    // 2. MESCLA COM O CATÁLOGO ESTRATÉGICO PETRONECT (PETRONECT_PUBLIC_FEED)
    // Garante que certames ambientais, de engenharia e saneamento de Veeluen / Excelência estejam sempre presentes
    if (Array.isArray(PETRONECT_PUBLIC_FEED)) {
      for (const feedItem of PETRONECT_PUBLIC_FEED) {
        if (!seenIds.has(feedItem.numero)) {
          seenIds.add(feedItem.numero);
          collected.push({ ...feedItem });
        }
      }
    }

    logService.addLog(LogType.INGESTION, `Coletor Petronect finalizou varredura com ${collected.length} certames capturados.`);
    return collected;
  }
}
