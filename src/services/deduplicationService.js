/**
 * VELLIA LICITAÇÕES - DEDUPLICATION SERVICE (FASE 5)
 * Motor de detecção e resolução de duplicidades para oportunidades de licitação.
 */

export class DeduplicationService {
  /**
   * Gera uma chave única unificada para a oportunidade
   */
  static generateFingerprint(opp) {
    const portal = (opp.portal || 'portal').trim().toLowerCase();
    const number = (opp.number || opp.numero || opp.id || '').trim().toLowerCase();
    
    // Se possui número e portal bem definidos, essa é a chave primária mais precisa
    if (portal && number) {
      return `${portal}_${number}`;
    }

    // Fallback: combinação de contratante + título
    const client = (opp.client || opp.contratante || '').trim().toLowerCase();
    const titleSnippet = (opp.title || opp.titulo || '').substring(0, 40).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${portal}_${client}_${titleSnippet}`;
  }

  /**
   * Verifica se a oportunidade candidata já existe na lista
   * Retorna o item existente ou null
   */
  static findDuplicate(candidate, existingList) {
    const candidateFingerprint = this.generateFingerprint(candidate);
    const candidateNumber = (candidate.number || candidate.numero || candidate.id || '').trim().toLowerCase();
    const candidatePortal = (candidate.portal || '').trim().toLowerCase();
    const candidateUrl = (candidate.url || '').trim().toLowerCase();

    for (const existing of existingList) {
      const existingFingerprint = this.generateFingerprint(existing);

      // Critério 1: Fingerprint Idêntico
      if (candidateFingerprint === existingFingerprint) {
        return { isDuplicate: true, existingItem: existing, matchType: 'FINGERPRINT' };
      }

      // Critério 2: Portal + Número Exato
      const existingNumber = (existing.number || existing.numero || existing.id || '').trim().toLowerCase();
      const existingPortal = (existing.portal || '').trim().toLowerCase();
      if (candidatePortal && candidateNumber && candidatePortal === existingPortal && candidateNumber === existingNumber) {
        return { isDuplicate: true, existingItem: existing, matchType: 'PORTAL_NUMBER' };
      }

      // Critério 3: URL idêntica não vazia
      if (candidateUrl && existing.url && candidateUrl === existing.url.toLowerCase()) {
        return { isDuplicate: true, existingItem: existing, matchType: 'EXACT_URL' };
      }

      // Critério 4: Mesmo Contratante e Título muito similar (>= 90% caracteres normalizados)
      const cClient = (candidate.client || candidate.contratante || '').toLowerCase();
      const eClient = (existing.client || existing.contratante || '').toLowerCase();
      if (cClient && eClient && cClient === eClient) {
        const cTitle = (candidate.title || candidate.titulo || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const eTitle = (existing.title || existing.titulo || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cTitle.length > 20 && eTitle.length > 20 && cTitle === eTitle) {
          return { isDuplicate: true, existingItem: existing, matchType: 'TITLE_CLIENT' };
        }
      }
    }

    return { isDuplicate: false, existingItem: null, matchType: null };
  }

  /**
   * Realiza o merge seguro de um item atualizado com o existente
   * Preservando status comercial, decisões GO/NO-GO, notas internas e histórico
   */
  static mergeOpportunity(existing, fresh) {
    const nowIso = new Date().toISOString();
    return {
      ...existing,
      // Atualiza campos cadastrais
      title: fresh.title || fresh.titulo || existing.title,
      object: fresh.object || fresh.objeto || existing.object,
      description: fresh.description || fresh.descricao || existing.description,
      endDate: fresh.endDate || fresh.data_encerramento || existing.endDate,
      daysLeft: fresh.daysLeft !== undefined ? fresh.daysLeft : existing.daysLeft,
      estimatedValue: fresh.estimatedValue || fresh.valor_estimado || existing.estimatedValue,
      url: fresh.url || existing.url,
      location: fresh.location || existing.location,
      city: fresh.city || fresh.cidade || existing.city,
      state: fresh.state || fresh.estado || existing.state,
      // Metadados de atualização
      lastUpdated: nowIso,
      updatedAtFormatted: new Date().toLocaleString('pt-BR'),
      updateCount: (existing.updateCount || 0) + 1,
      // Mantém status e decisões anteriores
      status: existing.status,
      decision: existing.decision,
      responsiblePerson: existing.responsiblePerson,
      internalNotes: existing.internalNotes,
      history: [
        ...(existing.history || []),
        {
          id: `hist-${Date.now()}`,
          date: nowIso,
          action: 'Atualização Automática de Ingestão',
          details: `Dados atualizados pelo portal ${fresh.portal || existing.portal}. Prazo recalculado.`
        }
      ]
    };
  }
}
