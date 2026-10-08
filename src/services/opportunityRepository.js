/**
 * VELLIA LICITAÇÕES - OPPORTUNITY REPOSITORY (FASE 5)
 * Repositório com persistência em localStorage para o banco estruturado de oportunidades.
 */

import { priorityOpportunities } from '../data/mockData.js';
import { analyzeOpportunityAdherence } from './semanticEngine.js';
import { TagService } from './tagService.js';

const OPPORTUNITIES_STORAGE_KEY = 'vellia_opportunities_db_v2';

export class OpportunityRepository {
  constructor() {
    this.opportunities = this.init();
  }

  init() {
    try {
      const stored = localStorage.getItem(OPPORTUNITIES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar do localStorage:', e);
    }

    // Seed inicial: converter os itens de mockData para a estrutura completa da Fase 5
    const seed = priorityOpportunities.map((item, index) => {
      const analysis = analyzeOpportunityAdherence({
        title: item.title,
        object: item.object,
        description: item.object,
        location: item.location,
        daysLeft: item.daysLeft
      });

      const nowIso = new Date().toISOString();

      return {
        id: `OPP-${item.id}`,
        number: item.id,
        portal: item.portal || 'Petronect',
        client: item.client || 'Petrobras',
        title: item.title,
        object: item.object,
        description: item.object,
        modality: item.modality || 'Licitação Eletrônica',
        contractType: 'Prestação de Serviços Especializados',
        situation: 'Publicada / Recebendo Propostas',
        publishDate: item.publishDate || '01/10/2026',
        endDate: item.endDate || '20/10/2026',
        daysLeft: item.daysLeft || 12,
        state: item.location?.split('-')[1]?.trim() || 'PE',
        city: item.location?.split('-')[0]?.trim() || 'Ipojuca',
        location: item.location || 'Ipojuca - PE',
        estimatedValue: item.estimatedValue || 'R$ 1.500.000,00',
        currency: 'BRL',
        url: `https://petronect.com/portal/oportunidade/${item.id}`,
        captureDate: nowIso,
        lastUpdated: nowIso,
        status: index === 0 ? 'Nova' : index === 1 ? 'Interessante' : 'Em análise',
        decision: index === 1 ? 'GO' : null,
        decisionReason: null,
        recommendedCompany: item.recommendedCompany || analysis.recommendedCompany,
        primaryService: item.identifiedService || analysis.primaryServiceName,
        relatedServices: analysis.relatedServices,
        score: item.score || analysis.finalScore,
        scoreTier: analysis.tierKey,
        priority: (item.score || analysis.finalScore) >= 90 ? 'Crítica' :
                  (item.score || analysis.finalScore) >= 80 ? 'Alta' :
                  (item.score || analysis.finalScore) >= 70 ? 'Média' :
                  (item.score || analysis.finalScore) >= 50 ? 'Baixa' : 'Muito baixa',
        tags: TagService.generateTags({
          ...item,
          recommendedCompany: item.recommendedCompany || analysis.recommendedCompany
        }),
        internalNotes: 'Oportunidade capturada no monitoramento Petronect.',
        responsiblePerson: index === 1 ? 'Carlos Silveira (Comercial)' : null,
        assignedDate: index === 1 ? nowIso : null,
        internalDeadline: null,
        sourceOrigin: 'Petronect',
        history: [
          {
            id: `hist-seed-${item.id}`,
            date: nowIso,
            action: 'Captura e Análise Inicial',
            details: `Identificada com ${item.score}% de aderência para ${item.recommendedCompany}.`
          }
        ],
        whyMatches: item.whyMatches,
        risks: item.risks,
        matchedKeywords: analysis.matchedKeywords,
        scoreBreakdown: analysis.scoreBreakdown,
        explanationSummary: analysis.explanationSummary
      };
    });

    this.save(seed);
    return seed;
  }

  save(data) {
    try {
      this.opportunities = data;
      localStorage.setItem(OPPORTUNITIES_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e);
    }
  }

  getAll() {
    return [...this.opportunities];
  }

  getById(id) {
    return this.opportunities.find(o => o.id === id || o.number === id) || null;
  }

  add(opportunity) {
    this.opportunities.unshift(opportunity);
    this.save(this.opportunities);
    return opportunity;
  }

  update(id, updatedFields) {
    const index = this.opportunities.findIndex(o => o.id === id || o.number === id);
    if (index === -1) return null;

    const existing = this.opportunities[index];
    const nowIso = new Date().toISOString();

    const merged = {
      ...existing,
      ...updatedFields,
      lastUpdated: nowIso,
      history: [
        ...(existing.history || []),
        ...(updatedFields.historyEntry ? [updatedFields.historyEntry] : [])
      ]
    };

    delete merged.historyEntry;
    this.opportunities[index] = merged;
    this.save(this.opportunities);
    return merged;
  }

  remove(id) {
    this.opportunities = this.opportunities.filter(o => o.id !== id && o.number !== id);
    this.save(this.opportunities);
    return true;
  }
}

export const opportunityRepository = new OpportunityRepository();
