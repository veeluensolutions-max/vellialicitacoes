/**
 * VELLIA LICITAÇÕES — CLIENTE DE INTEGRAÇÃO SUPABASE / POSTGREST
 * Conexão direta e ultra-leve com a API REST do Supabase (PostgreSQL)
 * Sem dependências pesadas, 100% nativo via fetch.
 */

const STORAGE_KEY_CONFIG = 'vellia_supabase_config_v1';

export class SupabaseClient {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    let url = '';
    let anonKey = '';

    // 1. Tenta carregar do localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
        if (stored) {
          const parsed = JSON.parse(stored);
          url = parsed.url || '';
          anonKey = parsed.anonKey || '';
        }
      }
    } catch (e) {
      console.warn('[SupabaseClient] Erro ao ler config do localStorage:', e);
    }

    // 2. Fallback para variáveis de ambiente Vite caso existam
    if (!url && typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) {
      url = import.meta.env.VITE_SUPABASE_URL;
    }
    if (!anonKey && typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) {
      anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    }

    return {
      url: url.replace(/\/+$/, ''), // Remove barra final se houver
      anonKey: anonKey.trim()
    };
  }

  saveConfig(url, anonKey) {
    this.config = {
      url: (url || '').trim().replace(/\/+$/, ''),
      anonKey: (anonKey || '').trim()
    };
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(this.config));
      }
    } catch (e) {
      console.warn('[SupabaseClient] Erro ao salvar config:', e);
    }
  }

  isConfigured() {
    return Boolean(this.config.url && this.config.anonKey);
  }

  getHeaders(customHeaders = {}) {
    return {
      'apikey': this.config.anonKey,
      'Authorization': `Bearer ${this.config.anonKey}`,
      'Content-Type': 'application/json',
      ...customHeaders
    };
  }

  /**
   * Mapeia objeto interno da oportunidade para a tabela PostgreSQL
   */
  mapToDb(opp) {
    if (!opp) return null;
    const nowIso = new Date().toISOString();

    return {
      id: String(opp.id || opp.number),
      number: String(opp.number || opp.id),
      portal: opp.portal || 'Petronect',
      client: opp.client || 'Órgão / Cliente',
      title: opp.title || opp.object || 'Oportunidade',
      object: opp.object || opp.title || '',
      description: opp.description || opp.object || '',
      modality: opp.modality || 'Pregão Eletrônico',
      contract_type: opp.contractType || 'Serviços Especializados',
      situation: opp.situation || 'Publicada / Recebendo Propostas',
      publish_date: opp.publishDate || '',
      end_date: opp.endDate || '',
      days_left: typeof opp.daysLeft === 'number' ? opp.daysLeft : null,
      state: opp.state || 'PE',
      city: opp.city || 'Recife',
      location: opp.location || `${opp.city || 'Recife'} - ${opp.state || 'PE'}`,
      estimated_value: opp.estimatedValue || 'Sob consulta',
      url: opp.url || '',
      status: opp.status || 'Nova',
      canonical_status: opp.canonicalStatus || 'IDENTIFIED',
      decision: opp.decision || null,
      decision_reason: opp.decisionReason || null,
      recommended_company: opp.recommendedCompany || 'Veeluen Solutions',
      company_scope: opp.companyScope || 'ALL',
      primary_service: opp.primaryService || opp.identifiedService || '',
      related_services: opp.relatedServices || [],
      score: opp.score || 0,
      score_tier: opp.scoreTier || 'LOW',
      priority: opp.priority || 'Média',
      tags: opp.tags || [],
      internal_notes: opp.internalNotes || '',
      responsible_person: opp.responsiblePerson || null,
      history: opp.history || [],
      why_matches: opp.whyMatches || [],
      risks: opp.risks || [],
      score_breakdown: opp.scoreBreakdown || {},
      explanation_summary: opp.explanationSummary || '',
      source_origin: opp.sourceOrigin || 'Sistema Vellia',
      last_updated: opp.lastUpdated || nowIso
    };
  }

  /**
   * Mapeia registro do banco para o modelo interno da oportunidade
   */
  mapFromDb(row) {
    if (!row) return null;

    return {
      id: row.id,
      number: row.number,
      portal: row.portal,
      client: row.client,
      title: row.title,
      object: row.object,
      description: row.description,
      modality: row.modality,
      contractType: row.contract_type,
      situation: row.situation,
      publishDate: row.publish_date,
      endDate: row.end_date,
      daysLeft: row.days_left,
      state: row.state,
      city: row.city,
      location: row.location,
      estimatedValue: row.estimated_value,
      url: row.url,
      status: row.status,
      canonicalStatus: row.canonical_status,
      decision: row.decision,
      decisionReason: row.decision_reason,
      recommendedCompany: row.recommended_company,
      companyScope: row.company_scope,
      primaryService: row.primary_service,
      relatedServices: row.related_services,
      score: Number(row.score) || 0,
      scoreTier: row.score_tier,
      priority: row.priority,
      tags: row.tags || [],
      internalNotes: row.internal_notes,
      responsiblePerson: row.responsible_person,
      history: row.history || [],
      whyMatches: row.why_matches || [],
      risks: row.risks || [],
      scoreBreakdown: row.score_breakdown || {},
      explanationSummary: row.explanation_summary,
      sourceOrigin: row.source_origin,
      lastUpdated: row.last_updated
    };
  }

  /**
   * Testa a conectividade com a instância do Supabase
   */
  async testConnection() {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'URL ou Chave do Supabase não configurados.',
        latencyMs: 0
      };
    }

    const startTime = Date.now();
    try {
      const endpoint = `${this.config.url}/rest/v1/opportunities?select=id&limit=1`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        let errDetail = response.statusText;
        try {
          const errJson = await response.json();
          errDetail = errJson.message || errJson.hint || response.statusText;
        } catch {}
        return {
          success: false,
          status: response.status,
          message: `Falha HTTP (${response.status}): ${errDetail}`,
          latencyMs
        };
      }

      return {
        success: true,
        message: 'Conexão com Supabase / PostgreSQL estabelecida com sucesso!',
        latencyMs,
        endpoint
      };
    } catch (err) {
      return {
        success: false,
        message: `Erro de rede ou CORS: ${err.message}`,
        latencyMs: Date.now() - startTime
      };
    }
  }

  /**
   * Insere ou atualiza (UPSERT) uma oportunidade na nuvem
   */
  async upsertOpportunity(opp) {
    if (!this.isConfigured()) return null;

    const row = this.mapToDb(opp);
    const endpoint = `${this.config.url}/rest/v1/opportunities`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders({
        'Prefer': 'resolution=merge-duplicates, return=representation'
      }),
      body: JSON.stringify(row)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erro ao salvar no Supabase (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return Array.isArray(data) && data.length > 0 ? this.mapFromDb(data[0]) : opp;
  }

  /**
   * Upload em lote (Bulk Upsert) de várias oportunidades
   */
  async bulkUpsert(opportunities) {
    if (!this.isConfigured() || !Array.isArray(opportunities) || opportunities.length === 0) {
      return { count: 0 };
    }

    const rows = opportunities.map(o => this.mapToDb(o)).filter(Boolean);
    const endpoint = `${this.config.url}/rest/v1/opportunities`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders({
        'Prefer': 'resolution=merge-duplicates, return=minimal'
      }),
      body: JSON.stringify(rows)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erro no bulk upsert do Supabase (${response.status}): ${errText}`);
    }

    return { count: rows.length, success: true };
  }

  /**
   * Consulta oportunidades da nuvem (ordenadas por última atualização)
   */
  async fetchOpportunities(limit = 100) {
    if (!this.isConfigured()) return [];

    const endpoint = `${this.config.url}/rest/v1/opportunities?order=last_updated.desc&limit=${limit}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erro ao buscar oportunidades no Supabase (${response.status}): ${errText}`);
    }

    const rows = await response.json();
    return (rows || []).map(r => this.mapFromDb(r));
  }

  /**
   * Exclui oportunidade na nuvem
   */
  async deleteOpportunity(id) {
    if (!this.isConfigured() || !id) return false;

    const endpoint = `${this.config.url}/rest/v1/opportunities?id=eq.${encodeURIComponent(id)}`;
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return response.ok;
  }
}

export const supabaseClient = new SupabaseClient();
export default supabaseClient;
