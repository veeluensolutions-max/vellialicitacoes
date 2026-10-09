/**
 * VELLIA LICITAÇÕES — FASE 22: GO-LIVE CONTROLADO + PILOTO REAL + OPERAÇÃO ASSISTIDA
 * incidentManagementService.js: Gestão de Incidentes (SEV-1 a SEV-4),
 * Incident Timeline e Post-Mortem Blameless (sem culpar usuários).
 */

import { IncidentSeverity } from './goLiveModels.js';

const STORAGE_KEYS = {
  INCIDENTS: 'vellia_incidents_v22'
};

const INITIAL_INCIDENTS = [
  {
    id: 'INC-2026-001',
    title: 'Latência elevada e timeout intermitente na consulta do Portal Petronect',
    severity: IncidentSeverity.SEV3,
    status: 'RESOLVED',
    detectedAt: '2026-10-08T11:15:00.000Z',
    resolvedAt: '2026-10-08T11:42:00.000Z',
    affectedComponents: ['Conector Petronect', 'Fila de Ingestão'],
    timeline: [
      { phase: 'Detecção', time: '11:15', note: 'Telemetria acusou tempo de resposta > 12.000ms no gateway do Petronect.' },
      { phase: 'Impacto', time: '11:18', note: 'Sincronização de novos editais postergada em 27 minutos para 1 usuário ativo.' },
      { phase: 'Ação', time: '11:22', note: 'Ativado modo de fallback assíncrono com backoff exponencial e retry com jitter.' },
      { phase: 'Resolução', time: '11:42', note: 'Portal de origem normalizou resposta; conector reprocessou fila pendente sem perdas.' },
      { phase: 'Causa', time: '12:00', note: 'Manutenção programada não anunciada no CDN da Petrobras.' },
      { phase: 'Prevenção', time: '12:30', note: 'Ajustado timeout dinâmico e adicionado circuit breaker preventivo.' }
    ],
    postMortem: null
  },
  {
    id: 'INC-2026-002',
    title: 'Falha temporária de conexão com o Provedor de Embeddings de IA (Simulação Drill)',
    severity: IncidentSeverity.SEV2,
    status: 'RESOLVED',
    detectedAt: '2026-10-07T16:00:00.000Z',
    resolvedAt: '2026-10-07T16:18:00.000Z',
    affectedComponents: ['Vellia Agent IA Core', 'Motor Semântico'],
    timeline: [
      { phase: 'Detecção', time: '16:00', note: 'Invocação do endpoint de LLM retornou HTTP 503 temporário.' },
      { phase: 'Impacto', time: '16:02', note: 'Geração de síntese executiva pausada. Cadastro e visualização de documentos preservados.' },
      { phase: 'Ação', time: '16:05', note: 'Fallback automático ativado para modo léxico e cache de embeddings locais.' },
      { phase: 'Resolução', time: '16:18', note: 'Conexão restaurada com o provedor secundário de IA.' },
      { phase: 'Causa', time: '16:30', note: 'Instabilidade na zona leste do provedor cloud externo.' },
      { phase: 'Prevenção', time: '17:00', note: 'Implementada redundância multi-região para o serviço de IA.' }
    ],
    // Item 30 e 31: Post-Mortem Blameless focado no sistema e processo
    postMortem: {
      required: true,
      author: 'Carlos Albuquerque (Admin) & Equipe SRE',
      date: '2026-10-07',
      whatHappened: 'O provedor externo de inteligência artificial apresentou indisponibilidade regional de 18 minutos.',
      businessImpact: 'Nenhum dado ou documento foi perdido. Usuários puderam continuar acessando propostas, cadastros e anexos.',
      rootCause: 'Indisponibilidade momentânea no gateway do provedor externo sem chaveamento multi-região automático configurado.',
      resolutionSteps: 'Ativação do fallback heurístico local e chaveamento para endpoint espelho.',
      howToPreventRecurrence: 'Configurar failover automático com circuit breaker ativo para o segundo provedor de IA com teste periódico no cron de saúde.'
    }
  }
];

export class IncidentManagementService {
  static getIncidents() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEYS.INCIDENTS);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Erro ao ler incidentes:', e);
    }
    return INITIAL_INCIDENTS;
  }

  static createIncident({
    title,
    severityKey, // 'SEV1', 'SEV2', 'SEV3', 'SEV4'
    affectedComponents = [],
    detectedAt = new Date().toISOString(),
    initialNote = ''
  }) {
    const list = this.getIncidents();
    const severity = IncidentSeverity[severityKey] || IncidentSeverity.SEV3;

    const newId = `INC-2026-${String(list.length + 1).padStart(3, '0')}`;
    const newInc = {
      id: newId,
      title,
      severity,
      status: 'OPEN',
      detectedAt,
      resolvedAt: null,
      affectedComponents,
      timeline: [
        { phase: 'Detecção', time: new Date().toLocaleTimeString('pt-BR'), note: initialNote || 'Incidente registrado pelo monitoramento.' }
      ],
      postMortem: severity.critical ? {
        required: true,
        author: 'Pendente',
        date: new Date().toISOString().split('T')[0],
        whatHappened: '',
        businessImpact: '',
        rootCause: '',
        resolutionSteps: '',
        howToPreventRecurrence: ''
      } : null
    };

    list.unshift(newInc);
    this._save(list);
    return newInc;
  }

  static addTimelineEntry(incidentId, phase, note) {
    const list = this.getIncidents();
    const inc = list.find(i => i.id === incidentId);
    if (!inc) throw new Error('Incidente não encontrado');

    inc.timeline.push({
      phase,
      time: new Date().toLocaleTimeString('pt-BR'),
      note
    });

    if (phase === 'Resolução') {
      inc.status = 'RESOLVED';
      inc.resolvedAt = new Date().toISOString();
    }

    this._save(list);
    return inc;
  }

  static updatePostMortem(incidentId, postMortemData) {
    const list = this.getIncidents();
    const inc = list.find(i => i.id === incidentId);
    if (!inc) throw new Error('Incidente não encontrado');

    inc.postMortem = {
      ...inc.postMortem,
      ...postMortemData,
      updatedAt: new Date().toISOString()
    };

    this._save(list);
    return inc;
  }

  static getIncidentMetrics() {
    const list = this.getIncidents();
    const openIncidents = list.filter(i => i.status === 'OPEN');
    const criticalOpen = openIncidents.filter(i => i.severity.level <= 2);

    return {
      total: list.length,
      openCount: openIncidents.length,
      resolvedCount: list.filter(i => i.status === 'RESOLVED').length,
      criticalOpenCount: criticalOpen.length,
      hasBlockingSev1: list.some(i => i.status === 'OPEN' && i.severity.code === 'SEV-1'),
      hasBlockingSev2: list.some(i => i.status === 'OPEN' && i.severity.code === 'SEV-2')
    };
  }

  static _save(list) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(list));
    }
  }
}
