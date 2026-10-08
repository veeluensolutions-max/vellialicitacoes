/**
 * VELLIA LICITAÇÕES — FASE 16
 * earlyRadarService.js
 * Serviço central de inteligência do Radar Antecipado.
 * Orquestra PCAs, Contratos a Vencer, Padrões de Compra, Watchlists, Ações Comerciais e Alertas.
 */

import { EarlyRecordType, AlertPriority } from './earlyRadarModels.js';
import { contractMonitoringService } from './contractMonitoringService.js';
import { buyingPatternService } from './buyingPatternService.js';
import { signalClusterService } from './signalClusterService.js';

const STORAGE_KEY_PCA = 'vellia_pca_records_v16';
const STORAGE_KEY_ACTIONS = 'vellia_commercial_actions_v16';
const STORAGE_KEY_WATCHLIST_ORGANS = 'vellia_watchlist_organs_v16';
const STORAGE_KEY_WATCHLIST_SERVICES = 'vellia_watchlist_services_v16';
const STORAGE_KEY_ALERTS = 'vellia_early_alerts_v16';

export const INITIAL_PCA_RECORDS = [
  {
    id: 'PCA-2026-PETRO-442',
    organ: 'Petrobras — Petróleo Brasileiro S/A',
    organShort: 'Petrobras RNEST',
    unit: 'Refinaria Abreu e Lima (Ipojuca/PE)',
    itemNumber: 442,
    plannedObject: 'Serviço contínuo de operação, manutenção preventiva e monitoramento de Estação de Tratamento de Efluentes Industriais e Sanitários (ETE)',
    description: 'Contratação de equipe especializada em operação industrial 24/7 com fornecimento de insumos químicos para tratamento biológico e físico-químico.',
    category: 'Engenharia e Meio Ambiente',
    estimatedValue: 3800000.00,
    year: 2026,
    predictedDate: '2026-11-20',
    dateConfidenceNote: 'Data estimada com base no histórico e cronograma preliminar do PCA.',
    source: 'Plano de Contratações Anual — Petronect / Transparência Petrobras',
    sourceUrl: 'https://transparencia.petrobras.com.br/pca/2026/rnest-ete',
    targetService: 'Tratamento de Efluentes e Operação de ETE',
    adherencePercent: 94,
    status: EarlyRecordType.PLANNED,
    classification: 'Excelência Ambiental / Alta Aderência'
  },
  {
    id: 'PCA-2026-UFPE-018',
    organ: 'Universidade Federal de Pernambuco (UFPE)',
    organShort: 'UFPE',
    unit: 'Pró-Reitoria de Gestão Administrativa',
    itemNumber: 18,
    plannedObject: 'Serviço de amostragem e análise de emissões atmosféricas em dutos e chaminés de laboratórios e geradores',
    description: 'Atendimento às exigências do CPRH para renovação da Licença de Operação do Campus Recife.',
    category: 'Consultoria e Ensaios Ambientais',
    estimatedValue: 520000.00,
    year: 2026,
    predictedDate: '2026-12-05',
    dateConfidenceNote: 'Data estimada com base no histórico de empenhos de final de ano.',
    source: 'PNCP / Compras.gov.br (PCA 2026)',
    sourceUrl: 'https://pncp.gov.br/app/pca/24134488000108-2026-18',
    targetService: 'Monitoramento de Emissões Atmosféricas',
    adherencePercent: 91,
    status: EarlyRecordType.PLANNED,
    classification: 'Excelência Ambiental / Alta Aderência'
  },
  {
    id: 'PCA-2026-CHESF-088',
    organ: 'Eletrobras Chesf',
    organShort: 'CHESF',
    unit: 'Diretoria de Operação e Meio Ambiente',
    itemNumber: 88,
    plannedObject: 'Contratação de consultoria ambiental para monitoramento de ictiofauna e qualidade da água no Rio São Francisco',
    description: 'Cumprimento de condicionantes da Licença de Operação junto ao IBAMA.',
    category: 'Estudos Ambientais Especializados',
    estimatedValue: 1400000.00,
    year: 2026,
    predictedDate: '2027-02-15',
    dateConfidenceNote: 'Data estimada com base no plano plurianual.',
    source: 'PCA Chesf 2026/2027',
    sourceUrl: 'https://chesf.com.br/pca/2026/item-88',
    targetService: 'Licenciamento e Estudos Ambientais',
    adherencePercent: 78,
    status: EarlyRecordType.PLANNED,
    classification: 'Potencial / Monitorar'
  }
];

export const INITIAL_WATCHLIST_ORGANS = [
  { id: 'W-ORG-1', organName: 'Petrobras — Petróleo Brasileiro S/A', organShort: 'Petrobras', state: 'PE/RJ', notes: 'Cliente corporativo chave em contratos de O&M ambiental', isFavorite: true },
  { id: 'W-ORG-2', organName: 'Universidade Federal de Pernambuco (UFPE)', organShort: 'UFPE', state: 'PE', notes: 'Frequente contratante de monitoramento de emissões no 4º trimestre', isFavorite: true },
  { id: 'W-ORG-3', organName: 'Companhia Pernambucana de Saneamento (COMPESA)', organShort: 'COMPESA', state: 'PE', notes: 'Demanda recorrente de laudos e inspeções NR-13', isFavorite: true },
  { id: 'W-ORG-4', organName: 'Complexo Industrial Portuário de Suape', organShort: 'Porto de Suape', state: 'PE', notes: 'Oportunidades em resíduos e monitoramento portuário', isFavorite: true }
];

export const INITIAL_WATCHLIST_SERVICES = [
  { id: 'W-SRV-1', serviceName: 'Tratamento de Efluentes e Operação de ETE', priority: 'ALTA', notes: 'Core business de serviços de saneamento' },
  { id: 'W-SRV-2', serviceName: 'Monitoramento de Emissões Atmosféricas', priority: 'ALTA', notes: 'Atestados robustos e alta margem' },
  { id: 'W-SRV-3', serviceName: 'Inspeção e Conformidade NR-13', priority: 'MEDIA', notes: 'Volume recorrente e giro rápido' },
  { id: 'W-SRV-4', serviceName: 'Gestão e Destinação de Resíduos Perigosos', priority: 'MEDIA', notes: 'Contratos de médio e longo prazo' }
];

export const INITIAL_COMMERCIAL_ACTIONS = [
  {
    id: 'ACT-2026-001',
    clusterId: 'CLUST-PETRO-ETE',
    organ: 'Petrobras RNEST',
    contact: 'Gerência de SMS / Manutenção Industrial',
    responsible: 'Dr. Roberto Mendes (Dir. Comercial)',
    objective: 'Mapeamento prévio de requisitos técnicos e validação de acervo de CATs para operação de ETE industrial.',
    date: '2026-10-15',
    observation: 'Contrato atual do concorrente HidroEco encerra em novembro. Importante ter atestados já organizados.',
    nextAction: 'Reunir engenheiro químico responsável para revisar planilha de composição de custos.',
    checklist: {
      validarServico: true,
      validarAtestado: true,
      atualizarDocumentacao: true,
      verificarEquipe: false,
      verificarEquipamentos: true,
      estudarPrecosHistoricos: true,
      mapearConcorrentes: true
    },
    status: 'EM_ANDAMENTO'
  },
  {
    id: 'ACT-2026-002',
    clusterId: 'CLUST-UFPE-EMISSOES',
    organ: 'UFPE',
    contact: 'Divisão de Meio Ambiente e Infraestrutura',
    responsible: 'Camila Torres (Engenheira Ambiental)',
    objective: 'Verificar certidões de calibração dos amostradores de chaminé e certidão de regularidade CPRH.',
    date: '2026-10-20',
    observation: 'Historicamente o edital sai em novembro com prazo exíguo de abertura.',
    nextAction: 'Verificar disponibilidade da equipe técnica para campanha de campo em dezembro.',
    checklist: {
      validarServico: true,
      validarAtestado: true,
      atualizarDocumentacao: false,
      verificarEquipe: false,
      verificarEquipamentos: true,
      estudarPrecosHistoricos: true,
      mapearConcorrentes: false
    },
    status: 'PLANEJADA'
  }
];

export const INITIAL_EARLY_ALERTS = [
  {
    id: 'ALT-EARLY-01',
    title: 'Possível oportunidade futura de operação de ETE identificada',
    organ: 'Petrobras RNEST',
    service: 'Tratamento de Efluentes e Operação de ETE',
    priority: AlertPriority.ALTA_PRIORIDADE,
    message: 'PCA oficial e contrato vigente vencendo em 38 dias convergem com aderência de 94%.',
    evidence: 'PCA Petrobras item 442 + CTR-2023-PETRO-088',
    date: '2026-10-05',
    read: false
  },
  {
    id: 'ALT-EARLY-02',
    title: 'UFPE adicionou planejamento relacionado a Emissões Atmosféricas',
    organ: 'UFPE',
    service: 'Monitoramento de Emissões Atmosféricas',
    priority: AlertPriority.PREPARAR,
    message: 'Item incluído no PCA 2026 com previsão de abertura no 4º trimestre.',
    evidence: 'PNCP PCA 2026 item 18',
    date: '2026-10-06',
    read: false
  },
  {
    id: 'ALT-EARLY-03',
    title: 'Contrato semelhante da COMPESA vence em 43 dias',
    organ: 'COMPESA',
    service: 'Inspeção e Conformidade NR-13',
    priority: AlertPriority.MONITORAR,
    message: 'Contrato 401/2022 de inspeções NR-13 próximo do término. Risco de prorrogação médio.',
    evidence: 'Portal de Compras PE / Contrato 401/2022',
    date: '2026-10-07',
    read: false
  }
];

class EarlyRadarService {
  constructor() {
    this._ensureInitialized();
  }

  _safeGetStorage(key) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.warn(`[EarlyRadarService] Erro ao ler ${key}:`, e);
      }
    }
    return null;
  }

  _safeSetStorage(key, val) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {
        console.warn(`[EarlyRadarService] Erro ao gravar ${key}:`, e);
      }
    }
  }

  _ensureInitialized() {
    if (!this._safeGetStorage(STORAGE_KEY_PCA)) {
      this._safeSetStorage(STORAGE_KEY_PCA, INITIAL_PCA_RECORDS);
    }
    if (!this._safeGetStorage(STORAGE_KEY_ACTIONS)) {
      this._safeSetStorage(STORAGE_KEY_ACTIONS, INITIAL_COMMERCIAL_ACTIONS);
    }
    if (!this._safeGetStorage(STORAGE_KEY_WATCHLIST_ORGANS)) {
      this._safeSetStorage(STORAGE_KEY_WATCHLIST_ORGANS, INITIAL_WATCHLIST_ORGANS);
    }
    if (!this._safeGetStorage(STORAGE_KEY_WATCHLIST_SERVICES)) {
      this._safeSetStorage(STORAGE_KEY_WATCHLIST_SERVICES, INITIAL_WATCHLIST_SERVICES);
    }
    if (!this._safeGetStorage(STORAGE_KEY_ALERTS)) {
      this._safeSetStorage(STORAGE_KEY_ALERTS, INITIAL_EARLY_ALERTS);
    }
  }

  // --- 1. PLANEJAMENTOS (PCA) ---
  getAllPcas() {
    return this._safeGetStorage(STORAGE_KEY_PCA) || INITIAL_PCA_RECORDS;
  }

  addPca(pca) {
    const list = this.getAllPcas();
    const newEntry = {
      id: pca.id || `PCA-${Date.now()}`,
      organ: pca.organ || 'Órgão Federal',
      organShort: pca.organShort || (pca.organ ? pca.organ.substring(0, 20) : 'Órgão'),
      unit: pca.unit || 'Geral',
      itemNumber: pca.itemNumber || 1,
      plannedObject: pca.plannedObject || '',
      description: pca.description || '',
      category: pca.category || 'Serviços de Engenharia',
      estimatedValue: Number(pca.estimatedValue) || 0,
      year: Number(pca.year) || new Date().getFullYear(),
      predictedDate: pca.predictedDate || '',
      dateConfidenceNote: 'Data estimada com base no cronograma informado pelo órgão.',
      source: pca.source || 'PCA PNCP',
      sourceUrl: pca.sourceUrl || '',
      targetService: pca.targetService || 'Serviço Geral',
      adherencePercent: Number(pca.adherencePercent) || 80,
      status: EarlyRecordType.PLANNED,
      classification: pca.adherencePercent >= 85 ? 'Alta Aderência' : 'Monitorar'
    };

    list.push(newEntry);
    this._safeSetStorage(STORAGE_KEY_PCA, list);
    return newEntry;
  }

  // --- 2. CONTRATOS A VENCER (Delegado ao contractMonitoringService) ---
  getExpiringContracts(windowKey) {
    return contractMonitoringService.getContractsByWindow(windowKey);
  }

  // --- 3. PADRÕES DE COMPRA (Delegado ao buyingPatternService) ---
  getBuyingPatterns() {
    return buyingPatternService.getAllPatterns();
  }

  getOrganProfile(organQuery) {
    const pattern = buyingPatternService.getPatternByOrgan(organQuery);
    const contracts = contractMonitoringService.findMatchingContracts(organQuery, '');
    const pcas = this.getAllPcas().filter(p => 
      p.organ.toLowerCase().includes((organQuery || '').toLowerCase()) ||
      p.organShort.toLowerCase().includes((organQuery || '').toLowerCase())
    );

    return {
      pattern,
      activeExpiringContracts: contracts,
      activePcas: pcas
    };
  }

  // --- 4. WATCHLISTS ---
  getWatchlistOrgans() {
    return this._safeGetStorage(STORAGE_KEY_WATCHLIST_ORGANS) || INITIAL_WATCHLIST_ORGANS;
  }

  toggleFavoriteOrgan(organId) {
    const list = this.getWatchlistOrgans();
    const item = list.find(o => o.id === organId);
    if (item) {
      item.isFavorite = !item.isFavorite;
      this._safeSetStorage(STORAGE_KEY_WATCHLIST_ORGANS, list);
    }
    return list;
  }

  getWatchlistServices() {
    return this._safeGetStorage(STORAGE_KEY_WATCHLIST_SERVICES) || INITIAL_WATCHLIST_SERVICES;
  }

  // --- 5. SINAIS CONSOLIDADOS & PIPELINE ANTECIPADO ---
  getSignalClusters() {
    return signalClusterService.getSignalClusters();
  }

  getConversionMetrics() {
    return signalClusterService.getConversionMetrics();
  }

  // --- 6. AÇÕES COMERCIAIS PREVENTIVAS (Itens 27, 28, 29, 31) ---
  getCommercialActions() {
    return this._safeGetStorage(STORAGE_KEY_ACTIONS) || INITIAL_COMMERCIAL_ACTIONS;
  }

  addCommercialAction(action) {
    const list = this.getCommercialActions();
    const newAction = {
      id: action.id || `ACT-${Date.now()}`,
      clusterId: action.clusterId || '',
      organ: action.organ || '',
      contact: action.contact || 'A definir',
      responsible: action.responsible || 'Responsável Comercial',
      objective: action.objective || '',
      date: action.date || new Date().toISOString().split('T')[0],
      observation: action.observation || '',
      nextAction: action.nextAction || '',
      checklist: {
        validarServico: action.checklist?.validarServico ?? true,
        validarAtestado: action.checklist?.validarAtestado ?? false,
        atualizarDocumentacao: action.checklist?.atualizarDocumentacao ?? false,
        verificarEquipe: action.checklist?.verificarEquipe ?? false,
        verificarEquipamentos: action.checklist?.verificarEquipamentos ?? false,
        estudarPrecosHistoricos: action.checklist?.estudarPrecosHistoricos ?? true,
        mapearConcorrentes: action.checklist?.mapearConcorrentes ?? false
      },
      status: action.status || 'PLANEJADA',
      createdAt: new Date().toISOString()
    };

    list.push(newAction);
    this._safeSetStorage(STORAGE_KEY_ACTIONS, list);
    return newAction;
  }

  updateCommercialAction(actionId, patch) {
    const list = this.getCommercialActions();
    const index = list.findIndex(a => a.id === actionId);
    if (index >= 0) {
      list[index] = { ...list[index], ...patch, updatedAt: new Date().toISOString() };
      this._safeSetStorage(STORAGE_KEY_ACTIONS, list);
      return list[index];
    }
    return null;
  }

  // --- 7. ALERTAS DO RADAR ANTECIPADO (Itens 49, 50) ---
  getEarlyAlerts() {
    return this._safeGetStorage(STORAGE_KEY_ALERTS) || INITIAL_EARLY_ALERTS;
  }

  // --- 8. MAPA REGIONAL / VISÃO GEOGRÁFICA (Itens 36, 37) ---
  getRegionalSummary() {
    const pcas = this.getAllPcas();
    const contracts = contractMonitoringService.getAllContracts();
    const clusters = this.getSignalClusters();

    const regions = [
      {
        state: 'PE',
        regionName: 'Pernambuco (Estratégico / Base Principal)',
        isStrategicPriority: true,
        organsCount: 4,
        pcasCount: pcas.filter(p => p.organ.includes('Petrobras') || p.organ.includes('UFPE') || p.organ.includes('COMPESA') || p.organ.includes('Suape')).length,
        contractsCount: contracts.filter(c => c.state === 'PE').length,
        clustersCount: clusters.filter(cl => cl.state === 'PE').length,
        totalPotentialVolume: 12500000.00
      },
      {
        state: 'NE',
        regionName: 'Demais Estados do Nordeste (BA, CE, RN, AL)',
        isStrategicPriority: true,
        organsCount: 3,
        pcasCount: pcas.filter(p => p.organ.includes('Chesf')).length,
        contractsCount: 1,
        clustersCount: 1,
        totalPotentialVolume: 3500000.00
      },
      {
        state: 'BR',
        regionName: 'Brasil / Âmbito Federal Nacional',
        isStrategicPriority: false,
        organsCount: 5,
        pcasCount: 1,
        contractsCount: 0,
        clustersCount: 0,
        totalPotentialVolume: 4200000.00
      }
    ];

    return regions;
  }

  // --- 9. JOB DO RADAR (Itens 66, 67, 68) ---
  runEarlyRadarJob() {
    const timestamp = new Date().toISOString();
    // Processamento incremental simulado
    const clusters = this.getSignalClusters();
    const highPotential = clusters.filter(c => c.score >= 70);

    return {
      jobName: 'EarlyRadarJob',
      executedAt: timestamp,
      status: 'SUCCESS',
      type: 'INCREMENTAL',
      totalClustersProcessed: clusters.length,
      highPotentialFound: highPotential.length,
      message: `Job executado com sucesso. ${clusters.length} clusters de sinais auditados e ponderados.`
    };
  }
}

export const earlyRadarService = new EarlyRadarService();
