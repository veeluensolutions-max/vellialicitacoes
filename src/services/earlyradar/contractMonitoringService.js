/**
 * VELLIA LICITAÇÕES — FASE 16
 * contractMonitoringService.js
 * Monitoramento de contratos públicos a vencer, fornecedores incumbentes e sinais prévios.
 */

import { ExpirationWindow, classifyExpirationWindow, IncumbencyRisk } from './earlyRadarModels.js';

const STORAGE_KEY_CONTRACTS = 'vellia_expiring_contracts_v16';

export const INITIAL_EXPIRING_CONTRACTS = [
  {
    id: 'CTR-2023-PETRO-088',
    organ: 'Petrobras — Refinaria Abreu e Lima (RNEST)',
    organShort: 'Petrobras RNEST',
    state: 'PE',
    number: '4600589123/2023',
    object: 'Prestação de serviços contínuos de operação e manutenção de ETE e Estação de Tratamento de Efluentes Oleosos',
    relatedService: 'Tratamento de Efluentes e Operação de ETE',
    currentSupplier: 'HidroEco Saneamento Industrial Ltda.',
    isIncumbentKnown: true,
    initialValue: 3450000.00,
    startDate: '2023-11-15',
    endDate: '2026-11-15', // ~40 dias
    estimatedDaysRemaining: 38,
    canBeExtended: true,
    extensionNotes: 'Contrato já possui 2 aditivos de prorrogação. Limite regulatório da Lei 13.303/2016 se aproxima de 5 anos.',
    source: 'Petronect / Transparência Petrobras',
    sourceUrl: 'https://transparencia.petrobras.com.br/contratos/4600589123',
    incumbencyRisk: IncumbencyRisk.MEDIO,
    status: 'VIGENTE'
  },
  {
    id: 'CTR-2024-UFPE-012',
    organ: 'Universidade Federal de Pernambuco (UFPE)',
    organShort: 'UFPE',
    state: 'PE',
    number: '012/2024-PROGEST',
    object: 'Serviços de monitoramento e medição de emissões atmosféricas em caldeiras e chaminés de laboratórios',
    relatedService: 'Monitoramento de Emissões Atmosféricas',
    currentSupplier: 'ArLimpo Engenharia Ambiental Eireli',
    isIncumbentKnown: true,
    initialValue: 480000.00,
    startDate: '2024-12-01',
    endDate: '2026-12-01', // ~54 dias
    estimatedDaysRemaining: 54,
    canBeExtended: false,
    extensionNotes: 'Último ano improrrogável segundo parecer jurídico nº 88/2026.',
    source: 'PNCP / Compras.gov.br',
    sourceUrl: 'https://pncp.gov.br/app/contratos/24134488000108-2-000012-2024',
    incumbencyRisk: IncumbencyRisk.BAIXO,
    status: 'VIGENTE'
  },
  {
    id: 'CTR-2022-COMPESA-401',
    organ: 'Companhia Pernambucana de Saneamento (COMPESA)',
    organShort: 'COMPESA',
    state: 'PE',
    number: '401/2022-DTE',
    object: 'Inspeção de integridade física e testes hidrostáticos em vasos de pressão e caldeiras (NR-13)',
    relatedService: 'Inspeção e Conformidade NR-13',
    currentSupplier: 'VellTech Caldeiraria e Inspeções',
    isIncumbentKnown: true,
    initialValue: 890000.00,
    startDate: '2022-10-30',
    endDate: '2026-11-20',
    estimatedDaysRemaining: 43,
    canBeExtended: true,
    extensionNotes: 'Órgão abriu consulta sobre preços praticados no mercado para verificar vantajosidade de prorrogação ou novo certame.',
    source: 'Portal de Compras PE',
    sourceUrl: 'https://www.compras.pe.gov.br/contratos/401-2022',
    incumbencyRisk: IncumbencyRisk.MEDIO,
    status: 'VIGENTE'
  },
  {
    id: 'CTR-2023-SUAPE-055',
    organ: 'Complexo Industrial Portuário de Suape',
    organShort: 'Porto de Suape',
    state: 'PE',
    number: '055/2023-DIRPRE',
    object: 'Gestão, transporte e destinação final ambientalmente adequada de resíduos industriais perigosos (Classe I)',
    relatedService: 'Gestão e Destinação de Resíduos Perigosos',
    currentSupplier: 'EcoDestino Soluções Ambientais S/A',
    isIncumbentKnown: true,
    initialValue: 1650000.00,
    startDate: '2023-12-20',
    endDate: '2027-01-15',
    estimatedDaysRemaining: 99,
    canBeExtended: true,
    extensionNotes: 'Possibilidade legal de prorrogação por mais 12 meses caso haja acordo de reajuste pelo IPCA.',
    source: 'PNCP',
    sourceUrl: 'https://pncp.gov.br/app/contratos/suape-055-2023',
    incumbencyRisk: IncumbencyRisk.ALTO,
    status: 'VIGENTE'
  },
  {
    id: 'CTR-2024-CHESF-119',
    organ: 'Eletrobras Chesf — Companhia Hidroelétrica do São Francisco',
    organShort: 'CHESF',
    state: 'PE',
    number: 'CT-CHESF-119/2024',
    object: 'Serviço de elaboração de estudos ambientais (EIA/RIMA, PCA/RCA) para subestações e linhas de transmissão',
    relatedService: 'Licenciamento e Estudos Ambientais',
    currentSupplier: 'Bioma Consultoria Ambiental',
    isIncumbentKnown: true,
    initialValue: 2100000.00,
    startDate: '2024-05-10',
    endDate: '2027-04-10',
    estimatedDaysRemaining: 184,
    canBeExtended: false,
    extensionNotes: 'Contrato por escopo de projeto. Previsão de entrega do RIMA final até abril/2027.',
    source: 'Petronect / Chesf Transparência',
    sourceUrl: 'https://chesf.com.br/contratos/119-2024',
    incumbencyRisk: IncumbencyRisk.BAIXO,
    status: 'VIGENTE'
  }
];

class ContractMonitoringService {
  constructor() {
    this._ensureInitialized();
  }

  _safeGetStorage(key) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.warn(`[ContractMonitoringService] Erro ao ler ${key}:`, e);
      }
    }
    return null;
  }

  _safeSetStorage(key, val) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {
        console.warn(`[ContractMonitoringService] Erro ao gravar ${key}:`, e);
      }
    }
  }

  _ensureInitialized() {
    const existing = this._safeGetStorage(STORAGE_KEY_CONTRACTS);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      this._safeSetStorage(STORAGE_KEY_CONTRACTS, INITIAL_EXPIRING_CONTRACTS);
    }
  }

  /**
   * Retorna todos os contratos monitorados com enriquecimento da janela de vencimento
   */
  getAllContracts() {
    const list = this._safeGetStorage(STORAGE_KEY_CONTRACTS) || INITIAL_EXPIRING_CONTRACTS;
    return list.map(c => ({
      ...c,
      windowCategory: classifyExpirationWindow(c.estimatedDaysRemaining),
      commercialSignalMessage: this.generateCommercialSignal(c)
    }));
  }

  /**
   * Gera texto estritamente condicional do sinal comercial (Item 11, 12: Não afirmar nova licitação)
   */
  generateCommercialSignal(contract) {
    const days = contract.estimatedDaysRemaining;
    const prorrogacao = contract.canBeExtended
      ? 'Dados indicam cláusula de prorrogação contratual admissível (não assumir renovação tácita).'
      : 'Cláusula de prorrogação esgotada ou contrato por escopo fixo.';

    return `Contrato semelhante de "${contract.relatedService}" encerra em aproximadamente ${days} dias no órgão ${contract.organShort}. ${prorrogacao} Sugere-se monitoramento preventivo de termo de referência ou PCA.`;
  }

  /**
   * Filtra contratos por janela de vencimento (Item 10)
   */
  getContractsByWindow(windowKey) {
    const all = this.getAllContracts();
    if (!windowKey) return all;
    return all.filter(c => c.windowCategory === windowKey);
  }

  /**
   * Busca contratos que coincidem com um órgão e/ou serviço
   */
  findMatchingContracts(organQuery = '', serviceQuery = '') {
    const all = this.getAllContracts();
    const organLower = organQuery.toLowerCase().trim();
    const srvLower = serviceQuery.toLowerCase().trim();

    return all.filter(c => {
      const matchOrgan = !organLower || c.organ.toLowerCase().includes(organLower) || c.organShort.toLowerCase().includes(organLower);
      const matchSrv = !srvLower || c.relatedService.toLowerCase().includes(srvLower) || c.object.toLowerCase().includes(srvLower);
      return matchOrgan && matchSrv;
    });
  }

  /**
   * Adiciona novo contrato ao monitoramento
   */
  addContract(contractData) {
    const all = this.getAllContracts();
    const newEntry = {
      id: contractData.id || `CTR-${Date.now()}`,
      organ: contractData.organ || 'Órgão Não Informado',
      organShort: contractData.organShort || (contractData.organ ? contractData.organ.substring(0, 20) : 'Órgão'),
      state: contractData.state || 'BR',
      number: contractData.number || 'S/N',
      object: contractData.object || '',
      relatedService: contractData.relatedService || 'Serviço Geral',
      currentSupplier: contractData.currentSupplier || 'Não identificado',
      isIncumbentKnown: !!contractData.currentSupplier,
      initialValue: Number(contractData.initialValue) || 0,
      startDate: contractData.startDate || new Date().toISOString().split('T')[0],
      endDate: contractData.endDate || '',
      estimatedDaysRemaining: Number(contractData.estimatedDaysRemaining) || 90,
      canBeExtended: !!contractData.canBeExtended,
      extensionNotes: contractData.extensionNotes || '',
      source: contractData.source || 'Manual',
      sourceUrl: contractData.sourceUrl || '',
      incumbencyRisk: contractData.incumbencyRisk || IncumbencyRisk.MEDIO,
      status: 'VIGENTE'
    };

    all.push(newEntry);
    this._safeSetStorage(STORAGE_KEY_CONTRACTS, all);
    return newEntry;
  }
}

export const contractMonitoringService = new ContractMonitoringService();
