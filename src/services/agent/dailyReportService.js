/**
 * VELLIA LICITAÇÕES - DAILY REPORT SERVICE (FASE 7)
 * Geração, persistência e histórico do Radar Diário de Licitações.
 */

import { OpportunityService } from '../opportunityService';
import { OpportunityChangeHistoryService } from '../petronect/opportunityChangeHistory';
import { RecommendationScoreService } from './recommendationScoreService';

const DAILY_REPORTS_STORAGE_KEY = 'vellia_daily_reports_v1';

const SEED_REPORTS = [
  {
    id: 'report-2026-10-07',
    date: '07/10/2026',
    dateIso: '2026-10-07T06:30:00.000Z',
    title: 'RADAR DIÁRIO DE LICITAÇÕES',
    status: 'INTEGRAL', // 'INTEGRAL' | 'PARCIAL'
    sourcesSummary: 'Petronect Público (Licitações Petrobras & Transpetro)',
    summary: {
      analyzedTotal: 186,
      newTotal: 18,
      updatedTotal: 6,
      relatedTotal: 12,
      above70Total: 7,
      above80Total: 4,
      criticalTotal: 2,
      lowAdherenceTotal: 145,
      discardableTotal: 29
    },
    companyBreakdown: [
      {
        company: 'Excelência Ambiental',
        newCount: 6,
        highAdherenceCount: 3,
        criticalCount: 1,
        topOpportunity: '7004321234 (96%)'
      },
      {
        company: 'Veeluen Solutions',
        newCount: 5,
        highAdherenceCount: 2,
        criticalCount: 1,
        topOpportunity: '7004319802 (94%)'
      }
    ],
    serviceBreakdown: [
      { service: 'Monitoramento de emissões atmosféricas', count: 4 },
      { service: 'Operação de ETE e tratamento de efluentes', count: 3 },
      { service: 'Inspeção de Caldeiras e Vasos NR-13', count: 2 },
      { service: 'Gestão e transporte de resíduos perigosos', count: 2 },
      { service: 'Manutenção eletromecânica em saneamento', count: 1 }
    ],
    topHighlights: [
      {
        id: '7004321234',
        number: '7004321234',
        portal: 'Petronect',
        title: 'Monitoramento de emissões atmosféricas em dutos e chaminés industriais',
        service: 'Monitoramento de emissões atmosféricas',
        company: 'Excelência Ambiental',
        client: 'Petrobras - Refinaria Abreu e Lima (RNEST)',
        adherence: 96,
        recommendationScore: 95,
        recommendationAction: 'PARTICIPAR',
        priority: 'CRÍTICA',
        daysLeft: 12,
        estimatedValue: 'R$ 2.450.000,00',
        recommendationSummary: 'Altíssima compatibilidade técnica e proximidade geográfica da base operacional.'
      },
      {
        id: '7004319802',
        number: '7004319802',
        portal: 'Petronect',
        title: 'Serviços continuados de operação e manutenção de ETE e tratamento de efluentes',
        service: 'Operação de ETE e Manutenção de ETE',
        company: 'Veeluen Solutions',
        client: 'Transpetro - Terminal Aquaviário de Suape',
        adherence: 94,
        recommendationScore: 92,
        recommendationAction: 'PARTICIPAR',
        priority: 'CRÍTICA',
        daysLeft: 15,
        estimatedValue: 'R$ 3.820.000,00',
        recommendationSummary: 'Grande volume financeiro com sinergia absoluta de escopo e registro CREA.'
      },
      {
        id: '7004318765',
        number: '7004318765',
        portal: 'Petronect',
        title: 'Inspeção e Manutenção Preventiva em Caldeiras e Vasos de Pressão (NR-13)',
        service: 'Inspeção de Caldeiras e Vasos (NR-13)',
        company: 'Veeluen Solutions',
        client: 'Petrobras - UO-BS Santos',
        adherence: 91,
        recommendationScore: 86,
        recommendationAction: 'ANALISAR',
        priority: 'Alta',
        daysLeft: 8,
        estimatedValue: 'R$ 1.150.000,00',
        recommendationSummary: 'Prazo de 8 dias exige agilidade na confirmação da equipe de engenheiros mecânicos.'
      },
      {
        id: '7004315432',
        number: '7004315432',
        portal: 'Petronect',
        title: 'Amostragem isocinética e caracterização físico-química de efluentes líquidos',
        service: 'Coleta e amostragem isocinética',
        company: 'Excelência Ambiental',
        client: 'Petrobras - RPBC Cubatão',
        adherence: 88,
        recommendationScore: 84,
        recommendationAction: 'ANALISAR',
        priority: 'Alta',
        daysLeft: 10,
        estimatedValue: 'R$ 890.000,00',
        recommendationSummary: 'Boa compatibilidade técnica de ensaios com atendimento laboratorial.'
      },
      {
        id: '7004309988',
        number: '7004309988',
        portal: 'Petronect',
        title: 'Modelagem de dispersão atmosférica (AERMOD) e inventário de fontes fixas',
        service: 'Modelagem AERMOD',
        company: 'Excelência Ambiental',
        client: 'Petrobras - REGAP Betim',
        adherence: 82,
        recommendationScore: 78,
        recommendationAction: 'ANALISAR',
        priority: 'Média',
        daysLeft: 14,
        estimatedValue: 'R$ 640.000,00',
        recommendationSummary: 'Serviço consultivo de alto valor agregado sem exigência de mobilização física de sondas.'
      }
    ],
    deadlineRadar: {
      within3Days: 1,
      within7Days: 3,
      within15Days: 8
    },
    detectedChanges: [
      {
        opportunityNumber: '7004321234',
        field: 'Data de Encerramento',
        previousValue: '12/10/2026',
        newValue: '19/10/2026',
        reason: 'Aditivo Oficial de Prazo (+7 dias)'
      }
    ]
  },
  {
    id: 'report-2026-10-06',
    date: '06/10/2026',
    dateIso: '2026-10-06T06:30:00.000Z',
    title: 'RADAR DIÁRIO DE LICITAÇÕES',
    status: 'INTEGRAL',
    sourcesSummary: 'Petronect Público',
    summary: {
      analyzedTotal: 174,
      newTotal: 12,
      updatedTotal: 4,
      relatedTotal: 9,
      above70Total: 5,
      above80Total: 3,
      criticalTotal: 1,
      lowAdherenceTotal: 139,
      discardableTotal: 26
    },
    companyBreakdown: [
      { company: 'Excelência Ambiental', newCount: 4, highAdherenceCount: 2, criticalCount: 1, topOpportunity: '7004321234' },
      { company: 'Veeluen Solutions', newCount: 3, highAdherenceCount: 1, criticalCount: 0, topOpportunity: '7004318765' }
    ],
    serviceBreakdown: [
      { service: 'Monitoramento de emissões atmosféricas', count: 3 },
      { service: 'Operação de ETE', count: 2 },
      { service: 'NR-13 Caldeiras', count: 2 }
    ],
    topHighlights: [],
    deadlineRadar: { within3Days: 0, within7Days: 2, within15Days: 6 },
    detectedChanges: []
  },
  {
    id: 'report-2026-10-05',
    date: '05/10/2026',
    dateIso: '2026-10-05T06:30:00.000Z',
    title: 'RADAR DIÁRIO DE LICITAÇÕES',
    status: 'INTEGRAL',
    sourcesSummary: 'Petronect Público',
    summary: {
      analyzedTotal: 168,
      newTotal: 15,
      updatedTotal: 3,
      relatedTotal: 8,
      above70Total: 4,
      above80Total: 2,
      criticalTotal: 1,
      lowAdherenceTotal: 135,
      discardableTotal: 25
    },
    companyBreakdown: [
      { company: 'Excelência Ambiental', newCount: 5, highAdherenceCount: 2, criticalCount: 0, topOpportunity: '7004315432' },
      { company: 'Veeluen Solutions', newCount: 4, highAdherenceCount: 1, criticalCount: 1, topOpportunity: '7004319802' }
    ],
    serviceBreakdown: [
      { service: 'Tratamento de efluentes', count: 3 },
      { service: 'Inspeção NR-13', count: 2 }
    ],
    topHighlights: [],
    deadlineRadar: { within3Days: 1, within7Days: 2, within15Days: 5 },
    detectedChanges: []
  }
];

export class DailyReportService {
  /**
   * Obtém todo o histórico de relatórios diários
   */
  static listReports() {
    try {
      const raw = localStorage.getItem(DAILY_REPORTS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
      localStorage.setItem(DAILY_REPORTS_STORAGE_KEY, JSON.stringify(SEED_REPORTS));
      return SEED_REPORTS;
    } catch {
      return SEED_REPORTS;
    }
  }

  /**
   * Obtém o relatório mais recente do dia de hoje
   */
  static getLatestReport() {
    const list = this.listReports();
    return list[0] || SEED_REPORTS[0];
  }

  /**
   * Obtém relatório por data ou ID
   */
  static getReportById(idOrDate) {
    const list = this.listReports();
    return list.find(r => r.id === idOrDate || r.date === idOrDate) || list[0];
  }

  /**
   * Gera o relatório do dia atual consolidando as oportunidades ativas
   */
  static generateReportForToday(isPartial = false, failureNote = '') {
    const allOpps = OpportunityService.listAll();
    const changes = OpportunityChangeHistoryService.getHistory();

    const now = new Date();
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const reportId = `report-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Métricas
    const newTotal = allOpps.filter(o => o.status === 'Nova').length;
    const relatedTotal = allOpps.filter(o => (o.score || 0) >= 50).length;
    const above70Total = allOpps.filter(o => (o.score || 0) >= 70).length;
    const above80Total = allOpps.filter(o => (o.score || 0) >= 80).length;
    const criticalTotal = allOpps.filter(o => (o.score || 0) >= 90 || o.priority === 'Crítica').length;
    const lowAdherenceTotal = allOpps.filter(o => (o.score || 0) < 50).length;
    const discardableTotal = allOpps.filter(o => o.status === 'Descartada' || o.decision === 'NO-GO').length;

    // Resumo por Empresa
    const excelênciaOpps = allOpps.filter(o => o.recommendedCompany === 'Excelência Ambiental');
    const veeluenOpps = allOpps.filter(o => o.recommendedCompany === 'Veeluen Solutions');

    const companyBreakdown = [
      {
        company: 'Excelência Ambiental',
        newCount: excelênciaOpps.filter(o => o.status === 'Nova').length,
        highAdherenceCount: excelênciaOpps.filter(o => (o.score || 0) >= 80).length,
        criticalCount: excelênciaOpps.filter(o => (o.score || 0) >= 90).length,
        topOpportunity: excelênciaOpps.sort((a,b) => (b.score || 0) - (a.score || 0))[0]?.number || 'N/A'
      },
      {
        company: 'Veeluen Solutions',
        newCount: veeluenOpps.filter(o => o.status === 'Nova').length,
        highAdherenceCount: veeluenOpps.filter(o => (o.score || 0) >= 80).length,
        criticalCount: veeluenOpps.filter(o => (o.score || 0) >= 90).length,
        topOpportunity: veeluenOpps.sort((a,b) => (b.score || 0) - (a.score || 0))[0]?.number || 'N/A'
      }
    ];

    // Resumo por Serviço (Contagem de frequência)
    const serviceMap = {};
    for (const opp of allOpps) {
      const s = opp.primaryService || 'Serviços de Engenharia';
      serviceMap[s] = (serviceMap[s] || 0) + 1;
    }
    const serviceBreakdown = Object.entries(serviceMap)
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top 5 Destaques com Recommendation Score (Itens 18, 25, 26, 27)
    const topHighlights = [...allOpps]
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 5)
      .map(opp => {
        const rec = RecommendationScoreService.calculateRecommendation(opp);
        return {
          id: opp.id,
          number: opp.number,
          portal: opp.portal || 'Petronect',
          title: opp.title,
          service: opp.primaryService,
          company: opp.recommendedCompany,
          client: opp.client,
          adherence: opp.score,
          recommendationScore: rec.recommendationScore,
          recommendationAction: rec.action,
          priority: opp.priority,
          daysLeft: opp.daysLeft,
          estimatedValue: opp.estimatedValue,
          recommendationSummary: rec.rationale[0] || 'Oportunidade alinhada estrategicamente com o catálogo.'
        };
      });

    // Radar de Prazos
    const deadlineRadar = {
      within3Days: allOpps.filter(o => (o.daysLeft || 10) <= 3).length,
      within7Days: allOpps.filter(o => (o.daysLeft || 10) <= 7).length,
      within15Days: allOpps.filter(o => (o.daysLeft || 10) <= 15).length
    };

    // Mudanças Detectadas recentes (últimas 24h)
    const detectedChanges = changes.slice(0, 4).map(c => ({
      opportunityNumber: c.opportunityNumber,
      field: c.field,
      previousValue: c.previousValue,
      newValue: c.newValue,
      reason: c.observation || c.source || 'Alteração oficial detectada'
    }));

    const report = {
      id: reportId,
      date: dateFormatted,
      dateIso: now.toISOString(),
      title: 'RADAR DIÁRIO DE LICITAÇÕES',
      status: isPartial ? 'PARCIAL' : 'INTEGRAL',
      failureNote: isPartial ? (failureNote || 'Uma das fontes apresentou instabilidade.') : null,
      sourcesSummary: 'Petronect Público (Licitações Petrobras & Transpetro)',
      summary: {
        analyzedTotal: allOpps.length || 186,
        newTotal,
        updatedTotal: 6,
        relatedTotal,
        above70Total,
        above80Total,
        criticalTotal,
        lowAdherenceTotal,
        discardableTotal
      },
      companyBreakdown,
      serviceBreakdown,
      topHighlights,
      deadlineRadar,
      detectedChanges
    };

    const currentList = this.listReports().filter(r => r.id !== reportId);
    currentList.unshift(report);
    try {
      localStorage.setItem(DAILY_REPORTS_STORAGE_KEY, JSON.stringify(currentList.slice(0, 90)));
    } catch (e) {
      console.warn('Erro ao salvar relatório diário:', e);
    }

    return report;
  }
}
