/**
 * VELLIA LICITAÇÕES - OPPORTUNITY SERVICE (FASE 5)
 * Lógica de negócio de oportunidades: cadastro manual, importação, reanálise e decisão GO/NO-GO.
 */

import { opportunityRepository } from './opportunityRepository.js';
import { analyzeOpportunityAdherence } from './semanticEngine.js';
import { DeduplicationService } from './deduplicationService.js';
import { TagService } from './tagService.js';
import { logService, LogType } from './logService.js';

// FASE 50: FLUXO CANÔNICO DE STATUS DA OPORTUNIDADE (Seções 23 e 24)
export const CanonicalStatus = {
  IDENTIFIED: 'IDENTIFIED',   // Identificada (recém-capturada no Radar)
  QUALIFIED: 'QUALIFIED',     // Qualificada (aderência semântica confirmada)
  GO_REVIEW: 'GO_REVIEW',     // Em Análise Go/No-Go
  PROPOSAL: 'PROPOSAL',       // Em Elaboração de Proposta / Precificação
  SUBMITTED: 'SUBMITTED',     // Proposta Enviada
  SESSION: 'SESSION',         // Em Disputa / Sessão Pública de Pregão
  WON: 'WON',                 // Homologada / Vencida
  LOST: 'LOST',               // Perdida
  CANCELLED: 'CANCELLED'      // Cancelada / Revogada
};

export const CanonicalStatusConfig = {
  [CanonicalStatus.IDENTIFIED]: { label: 'Identificada', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.12)' },
  [CanonicalStatus.QUALIFIED]: { label: 'Qualificada', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)' },
  [CanonicalStatus.GO_REVIEW]: { label: 'Em Análise Go/No-Go', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  [CanonicalStatus.PROPOSAL]: { label: 'Em Elaboração de Proposta', color: '#818CF8', bg: 'rgba(129, 140, 248, 0.12)' },
  [CanonicalStatus.SUBMITTED]: { label: 'Proposta Enviada', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.12)' },
  [CanonicalStatus.SESSION]: { label: 'Em Disputa / Sessão', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.12)' },
  [CanonicalStatus.WON]: { label: 'Homologada / Vencida', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
  [CanonicalStatus.LOST]: { label: 'Perdida', color: '#F87171', bg: 'rgba(248, 113, 113, 0.12)' },
  [CanonicalStatus.CANCELLED]: { label: 'Cancelada / Revogada', color: '#64748B', bg: 'rgba(100, 116, 139, 0.12)' }
};

export const OpportunityStatus = {
  NOVA: 'Nova',
  NAO_ANALISADA: 'Não analisada',
  EM_ANALISE: 'Em análise',
  INTERESSANTE: 'Interessante',
  GO: 'Go',
  NO_GO: 'No-Go',
  DOCUMENTACAO: 'Documentação',
  PRECIFICACAO: 'Precificação',
  PROPOSTA: 'Proposta',
  PARTICIPANDO: 'Participando',
  AGUARDANDO_RESULTADO: 'Aguardando resultado',
  GANHA: 'Ganha',
  PERDIDA: 'Perdida',
  DESCARTADA: 'Descartada'
};

export const PriorityLevel = {
  CRITICA: 'Crítica',
  ALTA: 'Alta',
  MEDIA: 'Média',
  BAIXA: 'Baixa',
  MUITO_BAIXA: 'Muito baixa'
};

export const NoGoReasons = [
  'Baixa aderência técnica',
  'Prazo inviável para participação',
  'Restrição de localização / logística',
  'Documentação ou certidões insuficientes',
  'Capacidade técnica ou atestado específico não disponível',
  'Valor estimado pouco atrativo ou margem inviável',
  'Risco jurídico ou contratual elevado',
  'Outro motivo estratégico'
];

export class OpportunityService {
  /**
   * Converte qualquer status em string legada para o CanonicalStatus correspondente
   */
  static normalizeToCanonicalStatus(rawStatus) {
    if (!rawStatus) return CanonicalStatus.IDENTIFIED;
    const s = String(rawStatus).toUpperCase().trim();
    if (CanonicalStatus[s]) return s;
    if (s.includes('GANHA') || s.includes('VENCIDA') || s.includes('HOMOLOGADA') || s.includes('WON')) return CanonicalStatus.WON;
    if (s.includes('PERDIDA') || s.includes('LOST')) return CanonicalStatus.LOST;
    if (s.includes('CANCEL') || s.includes('REVOGADA') || s.includes('DESCARTADA') || s.includes('NO-GO') || s.includes('NO_GO')) return CanonicalStatus.CANCELLED;
    if (s.includes('SESSÃO') || s.includes('DISPUTA') || s.includes('PARTICIPANDO') || s.includes('SESSION')) return CanonicalStatus.SESSION;
    if (s.includes('ENVIADA') || s.includes('SUBMITTED') || s.includes('AGUARDANDO RESULTADO')) return CanonicalStatus.SUBMITTED;
    if (s.includes('PROPOSTA') || s.includes('PRECIFICAÇÃO') || s.includes('DOCUMENTAÇÃO') || s.includes('PROPOSAL')) return CanonicalStatus.PROPOSAL;
    if (s.includes('ANÁLISE') || s.includes('ANALISE') || s.includes('GO_REVIEW') || s.includes('GO')) return CanonicalStatus.GO_REVIEW;
    if (s.includes('INTERESSANTE') || s.includes('QUALIFICADA') || s.includes('QUALIFIED')) return CanonicalStatus.QUALIFIED;
    return CanonicalStatus.IDENTIFIED;
  }

  /**
   * Obtém a configuração de exibição visual do status canônico
   */
  static getCanonicalStatusInfo(opportunityOrStatus) {
    const raw = typeof opportunityOrStatus === 'object' && opportunityOrStatus !== null
      ? (opportunityOrStatus.canonicalStatus || opportunityOrStatus.status)
      : opportunityOrStatus;
    const canonKey = this.normalizeToCanonicalStatus(raw);
    return {
      key: canonKey,
      ...(CanonicalStatusConfig[canonKey] || CanonicalStatusConfig[CanonicalStatus.IDENTIFIED])
    };
  }
  /**
   * Retorna a lista completa de oportunidades
   */
  static listAll() {
    return opportunityRepository.getAll();
  }

  /**
   * Retorna uma oportunidade por ID ou Número
   */
  static getById(id) {
    return opportunityRepository.getById(id);
  }

  /**
   * Calcula dias restantes entre hoje e a data de encerramento
   */
  static calculateDaysLeft(endDateStr) {
    if (!endDateStr) return 10;
    try {
      const parts = endDateStr.split(/[-/]/);
      let targetDate;
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          targetDate = new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
          // DD/MM/YYYY
          targetDate = new Date(parts[2], parts[1] - 1, parts[0]);
        }
      } else {
        targetDate = new Date(endDateStr);
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffTime = targetDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, isNaN(diffDays) ? 10 : diffDays);
    } catch {
      return 10;
    }
  }

  /**
   * Calcula prioridade recomendada com base no score de aderência
   */
  static derivePriority(score) {
    if (score >= 90) return PriorityLevel.CRITICA;
    if (score >= 80) return PriorityLevel.ALTA;
    if (score >= 70) return PriorityLevel.MEDIA;
    if (score >= 50) return PriorityLevel.BAIXA;
    return PriorityLevel.MUITO_BAIXA;
  }

  /**
   * Processa uma oportunidade bruta: executa Motor de Aderência, tags e prioridade
   */
  static enrichOpportunity(raw, origin = 'Cadastro manual') {
    const nowIso = new Date().toISOString();
    const daysLeft = raw.daysLeft !== undefined 
      ? Number(raw.daysLeft) 
      : this.calculateDaysLeft(raw.endDate || raw.data_encerramento);

    const location = raw.location || (raw.city && raw.state ? `${raw.city} - ${raw.state}` : raw.estado || 'PE');

    // Execução do Motor de Aderência Inteligente (Fase 4)
    const analysis = analyzeOpportunityAdherence({
      title: raw.title || raw.titulo || '',
      object: raw.object || raw.objeto || '',
      description: raw.description || raw.descricao || raw.object || '',
      location,
      daysLeft
    });

    const priority = raw.priority || this.derivePriority(analysis.finalScore);

    const opportunity = {
      id: raw.id || `OPP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      number: String(raw.number || raw.numero || raw.id || Date.now()),
      portal: raw.portal || 'Petronect',
      client: raw.client || raw.contratante || 'Petrobras',
      title: raw.title || raw.titulo || 'Oportunidade Comercial',
      object: raw.object || raw.objeto || '',
      description: raw.description || raw.descricao || raw.object || '',
      modality: raw.modality || raw.modalidade || 'Licitação Eletrônica',
      contractType: raw.contractType || 'Contratação de Serviços',
      situation: raw.situation || 'Aberta / Em andamento',
      publishDate: raw.publishDate || raw.data_publicacao || new Date().toLocaleDateString('pt-BR'),
      endDate: raw.endDate || raw.data_encerramento || '20/10/2026',
      daysLeft,
      state: raw.state || raw.estado || 'PE',
      city: raw.city || raw.cidade || 'Recife',
      location,
      estimatedValue: raw.estimatedValue 
        ? (typeof raw.estimatedValue === 'number' ? `R$ ${raw.estimatedValue.toLocaleString('pt-BR')},00` : raw.estimatedValue) 
        : raw.valor_estimado ? `R$ ${Number(raw.valor_estimado).toLocaleString('pt-BR')},00` : 'Sob consulta',
      currency: 'BRL',
      url: raw.url || raw.link || 'https://petronect.com/portal/oportunidades',
      captureDate: raw.captureDate || nowIso,
      lastUpdated: nowIso,
      status: raw.status || OpportunityStatus.NOVA,
      decision: raw.decision || null,
      decisionReason: raw.decisionReason || null,
      recommendedCompany: analysis.recommendedCompany,
      primaryService: analysis.primaryServiceName,
      relatedServices: analysis.relatedServices,
      score: analysis.finalScore,
      scoreTier: analysis.tierKey,
      priority,
      tags: [],
      internalNotes: raw.internalNotes || '',
      responsiblePerson: raw.responsiblePerson || null,
      assignedDate: raw.assignedDate || null,
      internalDeadline: raw.internalDeadline || null,
      sourceOrigin: origin,
      history: [
        {
          id: `hist-${Date.now()}`,
          date: nowIso,
          action: `Criada via ${origin}`,
          details: `Aderência calculada em ${analysis.finalScore}% (${analysis.classification}) para ${analysis.recommendedCompany}.`
        }
      ],
      whyMatches: [
        `Forte compatibilidade técnica com o catálogo de ${analysis.recommendedCompany}`,
        `Termos técnicos identificados no objeto: ${analysis.matchedKeywords.slice(0, 3).join(', ')}`,
        `Localização em ${location} dentro do raio de atendimento estratégico`
      ],
      risks: [
        daysLeft <= 7 ? 'Prazo apertado para preparação documental e esclarecimentos' : 'Prazo regular para análise comercial',
        'Necessidade de validação dos atestados técnicos específicos exigidos no edital'
      ],
      matchedKeywords: analysis.matchedKeywords,
      scoreBreakdown: analysis.scoreBreakdown,
      explanationSummary: analysis.explanationSummary
    };

    opportunity.tags = TagService.generateTags(opportunity);
    return opportunity;
  }

  /**
   * Cadastro manual de oportunidade pelo formulário da interface
   */
  static createManual(formData) {
    const existingList = opportunityRepository.getAll();
    const dupCheck = DeduplicationService.findDuplicate(formData, existingList);

    if (dupCheck.isDuplicate) {
      // Atualiza o existente com merge
      const merged = DeduplicationService.mergeOpportunity(dupCheck.existingItem, formData);
      opportunityRepository.update(dupCheck.existingItem.id, merged);
      logService.addLog(LogType.DUPLICATE, `Oportunidade ${formData.number || formData.numero} já existia. Dados atualizados sem duplicação.`, {
        id: dupCheck.existingItem.id,
        matchType: dupCheck.matchType
      });
      return { item: merged, action: 'UPDATED_DUPLICATE' };
    }

    const newOpp = this.enrichOpportunity(formData, 'Cadastro manual');
    opportunityRepository.add(newOpp);

    logService.addLog(LogType.MANUAL, `Nova oportunidade ${newOpp.number} cadastrada manualmente com ${newOpp.score}% de aderência.`, {
      id: newOpp.id,
      empresa: newOpp.recommendedCompany
    });

    return { item: newOpp, action: 'CREATED' };
  }

  /**
   * Importação por JSON individual ou lote
   */
  static importFromJson(jsonInput) {
    let parsed;
    try {
      parsed = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
    } catch (err) {
      logService.addLog(LogType.ERROR, 'Falha ao processar JSON de importação: formato inválido.', { error: err.message });
      throw new Error('Formato JSON inválido. Verifique a estrutura.');
    }

    const items = Array.isArray(parsed) ? parsed : [parsed];
    const results = {
      received: items.length,
      created: 0,
      updated: 0,
      duplicates: 0,
      errors: 0,
      details: []
    };

    const currentList = opportunityRepository.getAll();

    for (const raw of items) {
      try {
        const dupCheck = DeduplicationService.findDuplicate(raw, currentList);
        if (dupCheck.isDuplicate) {
          const merged = DeduplicationService.mergeOpportunity(dupCheck.existingItem, raw);
          opportunityRepository.update(dupCheck.existingItem.id, merged);
          results.updated++;
          results.duplicates++;
          results.details.push({
            number: merged.number,
            status: 'ATUALIZADO_DUPLICADO',
            score: merged.score
          });
        } else {
          const enriched = this.enrichOpportunity(raw, raw.portal || 'Importação JSON');
          opportunityRepository.add(enriched);
          currentList.unshift(enriched);
          results.created++;
          results.details.push({
            number: enriched.number,
            status: 'CRIADO',
            score: enriched.score
          });
        }
      } catch (err) {
        results.errors++;
        logService.addLog(LogType.ERROR, `Erro ao processar item do JSON: ${err.message}`, { raw });
      }
    }

    logService.addLog(LogType.IMPORT, `Importação JSON concluída: ${results.created} criados, ${results.updated} atualizados.`, results);
    return results;
  }

  /**
   * Reanalisa uma oportunidade existente pelo Motor de Aderência
   */
  static reanalyzeOpportunity(id) {
    const opp = opportunityRepository.getById(id);
    if (!opp) return null;

    const analysis = analyzeOpportunityAdherence({
      title: opp.title,
      object: opp.object,
      description: opp.description,
      location: opp.location,
      daysLeft: opp.daysLeft
    });

    const updated = opportunityRepository.update(opp.id, {
      score: analysis.finalScore,
      scoreTier: analysis.tierKey,
      recommendedCompany: analysis.recommendedCompany,
      primaryService: analysis.primaryServiceName,
      relatedServices: analysis.relatedServices,
      matchedKeywords: analysis.matchedKeywords,
      scoreBreakdown: analysis.scoreBreakdown,
      explanationSummary: analysis.explanationSummary,
      historyEntry: {
        id: `hist-re-${Date.now()}`,
        date: new Date().toISOString(),
        action: 'Reanálise Semântica Executada',
        details: `Nova aderência calculada: ${analysis.finalScore}% (${analysis.classification}).`
      }
    });

    logService.addLog(LogType.REPROCESS, `Oportunidade ${opp.number} reanalisada: novo score ${analysis.finalScore}%.`);
    return updated;
  }

  /**
   * Classifica a urgência do prazo com base nos dias restantes (Fase 6 - Item 14)
   * Mais de 15 dias: Normal
   * 8 a 15 dias: Atenção
   * 4 a 7 dias: Urgente
   * 0 a 3 dias: Crítico
   */
  static getDeadlineUrgency(daysLeft) {
    const d = Number(daysLeft) || 0;
    if (d > 15) {
      return { level: 'normal', label: 'Normal', text: `${d} dias restantes`, color: 'var(--color-green, #10b981)' };
    }
    if (d >= 8) {
      return { level: 'warning', label: 'Atenção', text: `${d} dias restantes`, color: 'var(--color-warning, #f59e0b)' };
    }
    if (d >= 4) {
      return { level: 'urgent', label: 'Urgente', text: `${d} dias restantes`, color: '#f97316' };
    }
    return { level: 'critical', label: 'Crítico', text: `${d} dias restantes`, color: 'var(--color-critical, #ef4444)' };
  }

  /**
   * Reprocessa todas as oportunidades salvas no banco com o Motor de Aderência (Fase 6 - Item 32)
   * Não coleta novamente do Petronect; utiliza dados estruturados já salvos.
   */
  static reanalyzeAllOpportunities() {
    const list = opportunityRepository.getAll();
    let reanalyzedCount = 0;

    for (const opp of list) {
      try {
        const analysis = analyzeOpportunityAdherence({
          title: opp.title,
          object: opp.object,
          description: opp.description || opp.object,
          location: opp.location,
          daysLeft: opp.daysLeft
        });

        opportunityRepository.update(opp.id, {
          score: analysis.finalScore,
          scoreTier: analysis.tierKey,
          recommendedCompany: analysis.recommendedCompany,
          primaryService: analysis.primaryServiceName,
          relatedServices: analysis.relatedServices,
          matchedKeywords: analysis.matchedKeywords,
          scoreBreakdown: analysis.scoreBreakdown,
          explanationSummary: analysis.explanationSummary,
          historyEntry: {
            id: `hist-reall-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            date: new Date().toISOString(),
            action: 'Reprocessamento Global de Aderência',
            details: `Recalculado com regras ativas. Novo score: ${analysis.finalScore}% para ${analysis.recommendedCompany}.`
          }
        });
        reanalyzedCount++;
      } catch (err) {
        console.warn(`Erro ao reanalisar oportunidade ${opp.id}:`, err);
      }
    }

    logService.addLog(
      LogType.REPROCESS,
      `Reprocessamento global concluído: ${reanalyzedCount} oportunidades recalculadas sem requisições de rede.`,
      { total: reanalyzedCount }
    );

    return { total: reanalyzedCount };
  }

  /**
   * Registra estrutura para aprendizado futuro com descartes NO-GO (Fase 6 - Item 19)
   */
  static recordNoGoLearning(opp, reason) {
    try {
      const STORAGE_KEY = 'vellia_nogo_learnings_v1';
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];

      const learningEntry = {
        id: `nogo-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        data: new Date().toISOString(),
        oportunidadeNumero: opp.number || opp.id,
        motivo: reason || 'Não especificado',
        servico: opp.primaryService || 'Não identificado',
        tipoDeOportunidade: opp.modality || opp.contractType || 'Não identificado',
        aderencia: opp.score || 0,
        empresa: opp.recommendedCompany || 'Não identificada',
        textoDaOportunidade: `${opp.title} — ${opp.object || ''}`.substring(0, 1000)
      };

      list.unshift(learningEntry);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 500)));
      return learningEntry;
    } catch (e) {
      console.warn('Erro ao salvar aprendizado com NO-GO:', e);
      return null;
    }
  }

  /**
   * Registra a Decisão Comercial: GO, NO-GO ou EM ANÁLISE
   */
  static recordDecision(id, decision, reason = null) {
    const opp = opportunityRepository.getById(id);
    if (!opp) return null;

    let newStatus = opp.status;
    if (decision === 'GO') {
      newStatus = OpportunityStatus.INTERESSANTE;
    } else if (decision === 'NO-GO') {
      newStatus = OpportunityStatus.DESCARTADA;
      // Salva estrutura de aprendizado futuro (Item 19)
      this.recordNoGoLearning(opp, reason);
    } else if (decision === 'EM_ANALISE') {
      newStatus = OpportunityStatus.EM_ANALISE;
    }

    const updated = opportunityRepository.update(opp.id, {
      decision,
      decisionReason: decision === 'NO-GO' ? reason : null,
      status: newStatus,
      historyEntry: {
        id: `hist-dec-${Date.now()}`,
        date: new Date().toISOString(),
        action: `Decisão Comercial: ${decision}`,
        details: decision === 'NO-GO' 
          ? `Marcada como NO-GO. Motivo: ${reason || 'Não especificado'}. Registrado aprendizado para o Motor de Aderência.`
          : `Decisão ${decision} registrada. Status atualizado para ${newStatus}.`
      }
    });

    logService.addLog(LogType.DECISION, `Decisão comercial ${decision} registrada para oportunidade ${opp.number}.`, {
      id,
      decision,
      reason
    });

    return updated;
  }

  /**
   * Atribui ou altera o responsável interno
   */
  static assignResponsible(id, { responsiblePerson, internalNotes, internalDeadline }) {
    const opp = opportunityRepository.getById(id);
    if (!opp) return null;

    const updated = opportunityRepository.update(opp.id, {
      responsiblePerson,
      assignedDate: new Date().toISOString(),
      internalNotes: internalNotes || opp.internalNotes,
      internalDeadline: internalDeadline || opp.internalDeadline,
      historyEntry: {
        id: `hist-resp-${Date.now()}`,
        date: new Date().toISOString(),
        action: 'Atribuição de Responsável',
        details: `Responsável atribuído: ${responsiblePerson}. Prazo interno: ${internalDeadline || 'Não definido'}.`
      }
    });

    logService.addLog(LogType.UPDATE, `Responsável ${responsiblePerson} atribuído à oportunidade ${opp.number}.`);
    return updated;
  }

  /**
   * Atualiza status manualmente
   */
  static updateStatus(id, newStatus) {
    const opp = opportunityRepository.getById(id);
    if (!opp) return null;

    return opportunityRepository.update(opp.id, {
      status: newStatus,
      historyEntry: {
        id: `hist-st-${Date.now()}`,
        date: new Date().toISOString(),
        action: 'Alteração Manual de Status',
        details: `Status alterado de "${opp.status}" para "${newStatus}".`
      }
    });
  }

  /**
   * Atualiza prioridade manualmente
   */
  static updatePriority(id, newPriority) {
    const opp = opportunityRepository.getById(id);
    if (!opp) return null;

    return opportunityRepository.update(opp.id, {
      priority: newPriority,
      historyEntry: {
        id: `hist-pr-${Date.now()}`,
        date: new Date().toISOString(),
        action: 'Alteração Manual de Prioridade',
        details: `Prioridade ajustada para "${newPriority}".`
      }
    });
  }
}

export default OpportunityService;

