/**
 * VELLIA LICITAÇÕES — FASE 16
 * signalClusterService.js
 * Consolidação e clustering de sinais (Órgão + Serviço + Horizonte),
 * cálculo de Cluster Score, Timeline de eventos e Rastreamento de Conversão.
 */

import { SignalType, EarlyRecordType, calculateFutureOpportunityScore } from './earlyRadarModels.js';

const STORAGE_KEY_SIGNALS = 'vellia_opportunity_signals_v16';
const STORAGE_KEY_CLUSTERS = 'vellia_signal_clusters_v16';

export const INITIAL_SIGNALS = [
  {
    id: 'SIG-2026-001',
    title: 'Indício de contratação: Operação contínua de ETE e tratamento oleoso',
    type: SignalType.PCA,
    recordType: EarlyRecordType.PLANNED,
    organ: 'Petrobras — Refinaria Abreu e Lima (RNEST)',
    organShort: 'Petrobras RNEST',
    state: 'PE',
    relatedService: 'Tratamento de Efluentes e Operação de ETE',
    targetHorizon: '60_DIAS',
    estimatedValue: 3800000.00,
    source: 'PCA Oficial Petrobras',
    sourceUrl: 'https://petrobras.com.br/pca/2026/rnest-ete',
    description: 'Item 442 do PCA 2026 prevê contratação de operação industrial de ETE com previsão de publicação no 4º trimestre.',
    adherencePercent: 94,
    detectedAt: '2026-09-15T10:00:00Z',
    audit: {
      source: 'PCA Oficial',
      evidence: 'Item 442 no PCA 2026',
      registeredBy: 'EarlyRadarJob',
      version: 'v16.1'
    },
    convertedOpportunityId: null,
    status: 'ACTIVE'
  },
  {
    id: 'SIG-2026-002',
    title: 'Contrato vigente em encerramento: ETE RNEST em 38 dias',
    type: SignalType.CONTRATO_EXPIRING,
    recordType: EarlyRecordType.PREDICTED,
    organ: 'Petrobras — Refinaria Abreu e Lima (RNEST)',
    organShort: 'Petrobras RNEST',
    state: 'PE',
    relatedService: 'Tratamento de Efluentes e Operação de ETE',
    targetHorizon: '60_DIAS',
    estimatedValue: 3450000.00,
    source: 'Contrato CTR-2023-PETRO-088',
    sourceUrl: 'https://transparencia.petrobras.com.br/contratos/4600589123',
    description: 'Contrato atual do operador incumbente atinge limite de 5 anos em 38 dias.',
    adherencePercent: 94,
    detectedAt: '2026-09-20T14:30:00Z',
    audit: {
      source: 'Contrato Público',
      evidence: 'Contrato nº 4600589123/2023',
      registeredBy: 'ContractMonitoringService',
      version: 'v16.1'
    },
    convertedOpportunityId: null,
    status: 'ACTIVE'
  },
  {
    id: 'SIG-2026-003',
    title: 'Planejamento oficial PNCP: Monitoramento contínuo de emissões atmosféricas',
    type: SignalType.PCA,
    recordType: EarlyRecordType.PLANNED,
    organ: 'Universidade Federal de Pernambuco (UFPE)',
    organShort: 'UFPE',
    state: 'PE',
    relatedService: 'Monitoramento de Emissões Atmosféricas',
    targetHorizon: '60_DIAS',
    estimatedValue: 520000.00,
    source: 'PCA Compras.gov / PNCP',
    sourceUrl: 'https://pncp.gov.br/pca/ufpe/2026-item-18',
    description: 'Inclusão oficial no PAC do governo federal para contratação de amostragem isocinética.',
    adherencePercent: 91,
    detectedAt: '2026-09-28T09:15:00Z',
    audit: {
      source: 'PNCP PCA',
      evidence: 'Item 18 do Plano de Contratações UFPE 2026',
      registeredBy: 'PNCPConnector',
      version: 'v16.1'
    },
    convertedOpportunityId: null,
    status: 'ACTIVE'
  },
  {
    id: 'SIG-2026-004',
    title: 'Recorrência histórica anual: Contratação recorrente no 4º trimestre UFPE',
    type: SignalType.RECORRENCIA_HISTORICA,
    recordType: EarlyRecordType.PREDICTED,
    organ: 'Universidade Federal de Pernambuco (UFPE)',
    organShort: 'UFPE',
    state: 'PE',
    relatedService: 'Monitoramento de Emissões Atmosféricas',
    targetHorizon: '60_DIAS',
    estimatedValue: 480000.00,
    source: 'Histórico Compras.gov.br (2023-2025)',
    sourceUrl: '',
    description: 'Órgão contratou o mesmo serviço em nov/2023, dez/2024 e out/2025.',
    adherencePercent: 91,
    detectedAt: '2026-10-01T11:00:00Z',
    audit: {
      source: 'Algoritmo Estatístico Temporal',
      evidence: '3 contratações sequenciais entre outubro e dezembro',
      registeredBy: 'BuyingPatternService',
      version: 'v16.1'
    },
    convertedOpportunityId: null,
    status: 'ACTIVE'
  },
  {
    id: 'SIG-2026-005',
    title: 'Vencimento de contrato de ensaios e calibração NR-13 COMPESA',
    type: SignalType.CONTRATO_EXPIRING,
    recordType: EarlyRecordType.PREDICTED,
    organ: 'Companhia Pernambucana de Saneamento (COMPESA)',
    organShort: 'COMPESA',
    state: 'PE',
    relatedService: 'Inspeção e Conformidade NR-13',
    targetHorizon: '60_DIAS',
    estimatedValue: 890000.00,
    source: 'Portal de Compras PE',
    sourceUrl: 'https://www.compras.pe.gov.br/contratos/401-2022',
    description: 'Contrato 401/2022 vence em 43 dias com pesquisa mercadológica iniciada.',
    adherencePercent: 88,
    detectedAt: '2026-10-02T16:20:00Z',
    audit: {
      source: 'Portal Estadual de Compras',
      evidence: 'Contrato 401/2022',
      registeredBy: 'ContractMonitoringService',
      version: 'v16.1'
    },
    convertedOpportunityId: null,
    status: 'ACTIVE'
  },
  {
    id: 'SIG-2026-006',
    title: 'Sinal convertido: Licitação de Resíduos Sólidos Suape publicada',
    type: SignalType.PCA,
    recordType: EarlyRecordType.OPEN,
    organ: 'Complexo Industrial Portuário de Suape',
    organShort: 'Porto de Suape',
    state: 'PE',
    relatedService: 'Gestão e Destinação de Resíduos Perigosos',
    targetHorizon: 'CONVERTED',
    estimatedValue: 1650000.00,
    source: 'PCA Suape / Convertido em PNCP 2026-0991',
    sourceUrl: 'https://pncp.gov.br/app/editais/suape-2026-0991',
    description: 'Sinal anterior identificado no PCA foi oficialmente publicado como Pregão Eletrônico nº 0991/2026 no PNCP.',
    adherencePercent: 95,
    detectedAt: '2026-08-10T08:00:00Z',
    audit: {
      source: 'PCA e PNCP Aberto',
      evidence: 'Pregão PNCP nº 0991/2026',
      registeredBy: 'ConversionWatcher',
      version: 'v16.1'
    },
    convertedOpportunityId: 'OPP-PNCP-2026-0991',
    status: 'CONVERTED'
  }
];

class SignalClusterService {
  constructor() {
    this._ensureInitialized();
  }

  _safeGetStorage(key) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.warn(`[SignalClusterService] Erro ao ler ${key}:`, e);
      }
    }
    return null;
  }

  _safeSetStorage(key, val) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {
        console.warn(`[SignalClusterService] Erro ao gravar ${key}:`, e);
      }
    }
  }

  _ensureInitialized() {
    const existingSignals = this._safeGetStorage(STORAGE_KEY_SIGNALS);
    if (!existingSignals || !Array.isArray(existingSignals) || existingSignals.length === 0) {
      this._safeSetStorage(STORAGE_KEY_SIGNALS, INITIAL_SIGNALS);
    }
  }

  /**
   * Retorna lista bruta de sinais de oportunidade
   */
  getAllSignals() {
    return this._safeGetStorage(STORAGE_KEY_SIGNALS) || INITIAL_SIGNALS;
  }

  /**
   * Adiciona um novo sinal com auditoria
   */
  addSignal(signal) {
    const all = this.getAllSignals();
    const newSig = {
      id: signal.id || `SIG-${Date.now()}`,
      title: signal.title || 'Indício de oportunidade futura',
      type: signal.type || SignalType.MANUAL,
      recordType: signal.recordType || EarlyRecordType.PREDICTED,
      organ: signal.organ || 'Órgão Não Informado',
      organShort: signal.organShort || (signal.organ ? signal.organ.substring(0, 20) : 'Órgão'),
      state: signal.state || 'BR',
      relatedService: signal.relatedService || 'Serviço Geral',
      targetHorizon: signal.targetHorizon || '90_DIAS',
      estimatedValue: Number(signal.estimatedValue) || 0,
      source: signal.source || 'Manual',
      sourceUrl: signal.sourceUrl || '',
      description: signal.description || '',
      adherencePercent: Number(signal.adherencePercent) || 75,
      detectedAt: signal.detectedAt || new Date().toISOString(),
      audit: {
        source: signal.source || 'Manual',
        evidence: signal.auditEvidence || signal.description,
        registeredBy: signal.registeredBy || 'Usuário Comercial',
        version: 'v16.1',
        createdAt: new Date().toISOString()
      },
      convertedOpportunityId: null,
      status: 'ACTIVE'
    };

    all.push(newSig);
    this._safeSetStorage(STORAGE_KEY_SIGNALS, all);
    return newSig;
  }

  /**
   * Agrupa sinais convergentes em Signal Clusters (Item 61, 62, 63):
   * Chave de Agrupamento: Órgão + Serviço + Horizonte
   * Calcula o FutureOpportunityScore consolidado do Cluster
   */
  getSignalClusters() {
    const signals = this.getAllSignals().filter(s => s.status !== 'DISCARDED');
    const clusterMap = new Map();

    signals.forEach(sig => {
      // Normaliza chaves
      const organKey = (sig.organShort || sig.organ).toLowerCase().trim();
      const srvKey = (sig.relatedService || '').toLowerCase().trim();
      const horizonKey = sig.status === 'CONVERTED' ? 'CONVERTED' : (sig.targetHorizon || '90_DIAS');
      const clusterKey = `${organKey}:::${srvKey}:::${horizonKey}`;

      if (!clusterMap.has(clusterKey)) {
        clusterMap.set(clusterKey, {
          clusterId: `CLUST-${Math.abs(clusterKey.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))}`,
          organ: sig.organ,
          organShort: sig.organShort,
          state: sig.state,
          relatedService: sig.relatedService,
          targetHorizon: horizonKey,
          signals: [],
          hasPca: false,
          hasExpiringContract: false,
          hasRecurrence: false,
          contractDaysRemaining: null,
          maxEstimatedValue: 0,
          bestAdherence: 0,
          isConverted: false,
          convertedOpportunityId: null,
          timeline: []
        });
      }

      const cl = clusterMap.get(clusterKey);
      cl.signals.push(sig);

      if (sig.type === SignalType.PCA || sig.type === SignalType.PLANEJAMENTO_OFICIAL) {
        cl.hasPca = true;
      }
      if (sig.type === SignalType.CONTRATO_EXPIRING || sig.type === SignalType.ATA_EXPIRING) {
        cl.hasExpiringContract = true;
        cl.contractDaysRemaining = 45; // estimativa padrão de proximidade
      }
      if (sig.type === SignalType.RECORRENCIA_HISTORICA || sig.type === SignalType.COMPRA_REPETITIVA) {
        cl.hasRecurrence = true;
      }
      if (sig.estimatedValue > cl.maxEstimatedValue) {
        cl.maxEstimatedValue = sig.estimatedValue;
      }
      if (sig.adherencePercent > cl.bestAdherence) {
        cl.bestAdherence = sig.adherencePercent;
      }
      if (sig.status === 'CONVERTED') {
        cl.isConverted = true;
        cl.convertedOpportunityId = sig.convertedOpportunityId;
      }

      // Adiciona na timeline
      cl.timeline.push({
        date: sig.detectedAt,
        type: sig.type,
        recordType: sig.recordType,
        source: sig.source,
        title: sig.title,
        description: sig.description
      });
    });

    const result = [];
    clusterMap.forEach(cl => {
      // Ordena timeline por data
      cl.timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Calcula Future Opportunity Score consolidado
      const scoreResult = calculateFutureOpportunityScore({
        hasPca: cl.hasPca,
        contractDaysRemaining: cl.contractDaysRemaining,
        hasRecurrence: cl.hasRecurrence,
        recurrenceCount: cl.signals.length >= 2 ? cl.signals.length : 1,
        adherencePercent: cl.bestAdherence || 85,
        estimatedValue: cl.maxEstimatedValue,
        isStrategicServiceOrOrgan: cl.organShort.toLowerCase().includes('petrobras') || cl.organShort.toLowerCase().includes('suape')
      });

      cl.scoreResult = scoreResult;
      cl.score = scoreResult.score;
      cl.tier = scoreResult.tier;
      cl.tierLabel = scoreResult.tierLabel;
      cl.badgeColor = scoreResult.badgeColor;

      // Status do cluster (Item 4: PLANNED, PREDICTED, OPEN)
      if (cl.isConverted) {
        cl.earlyStatus = EarlyRecordType.OPEN;
      } else if (cl.hasPca) {
        cl.earlyStatus = EarlyRecordType.PLANNED;
      } else {
        cl.earlyStatus = EarlyRecordType.PREDICTED;
      }

      result.push(cl);
    });

    // Ordena do maior score para o menor
    result.sort((a, b) => b.score - a.score);
    return result;
  }

  /**
   * Converte um sinal ou cluster em oportunidade real aberta (Itens 24, 25, 26)
   */
  convertSignalToOpportunity(signalId, openOpportunityId) {
    const all = this.getAllSignals();
    const target = all.find(s => s.id === signalId);
    if (!target) return false;

    target.status = 'CONVERTED';
    target.convertedOpportunityId = openOpportunityId;
    target.recordType = EarlyRecordType.OPEN;
    target.convertedAt = new Date().toISOString();

    this._safeSetStorage(STORAGE_KEY_SIGNALS, all);
    return true;
  }

  /**
   * Métricas de qualidade e conversão do Radar (Itens 25 e 26)
   */
  getConversionMetrics() {
    const signals = this.getAllSignals();
    const totalSignals = signals.length;
    const convertedSignals = signals.filter(s => s.status === 'CONVERTED').length;
    const activePredicted = signals.filter(s => s.recordType === EarlyRecordType.PREDICTED).length;
    const activePlanned = signals.filter(s => s.recordType === EarlyRecordType.PLANNED).length;

    // Métricas de funil antecipado: Sinais -> Oportunidades -> Propostas -> Vitórias
    const conversionRatePercent = totalSignals > 0 ? ((convertedSignals / totalSignals) * 100).toFixed(1) : '0.0';

    return {
      totalSignals,
      convertedSignals,
      activePredicted,
      activePlanned,
      conversionRatePercent: Number(conversionRatePercent),
      // Funil ilustrativo baseado nas conversões
      funnel: {
        signalsCreated: totalSignals,
        tendersPublished: convertedSignals,
        proposalsPrepared: 2, // 2 das oportunidades convertidas viraram propostas
        contractsWon: 1       // 1 contrato homologado com vitória
      }
    };
  }
}

export const signalClusterService = new SignalClusterService();
