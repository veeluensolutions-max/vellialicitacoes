/**
 * VELLIA LICITAÇÕES - SOURCE REPOSITORY (FASE 5)
 * Repositório para fontes de monitoramento (Petronect, PNCP, Compras.gov) e agendamento.
 */

const SOURCES_STORAGE_KEY = 'vellia_sources_db_v1';

export class SourceRepository {
  constructor() {
    this.sources = this.init();
  }

  init() {
    try {
      const stored = localStorage.getItem(SOURCES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar fontes:', e);
    }

    const initial = [
      {
        id: 'source-petronect',
        name: 'Petronect',
        type: 'Portal Privado de Contratação (Petrobras/Transpetro)',
        status: 'Preparado', // Preparado | Ativo | Sincronizando | Pausado | Erro
        baseUrl: 'https://www.petronect.com.br/portalpublico',
        lastSync: 'Ainda não executada',
        lastSuccess: null,
        nextSync: 'Sob demanda / Programada',
        capturedCount: 0,
        newCount: 0,
        relevantCount: 0,
        errorCount: 0,
        isActive: true,
        schedule: {
          enabled: false,
          frequency: 'A cada 3 horas',
          time: '06:00, 09:00, 12:00, 15:00, 18:00',
          timezone: 'America/Sao_Paulo (UTC-3)',
          last_run: null,
          next_run: 'Aguardando ativação do Agente Vellia'
        }
      },
      {
        id: 'source-pncp',
        name: 'PNCP (Portal Nacional de Contratações Públicas)',
        type: 'API REST Pública Oficial (Governo Federal)',
        status: 'Conectado / API Oficial',
        baseUrl: 'https://pncp.gov.br/api/consulta',
        lastSync: 'Disponível em tempo real',
        lastSuccess: new Date().toISOString(),
        nextSync: 'Sob demanda / Ativo',
        capturedCount: 0,
        newCount: 0,
        relevantCount: 0,
        errorCount: 0,
        isActive: true,
        schedule: {
          enabled: true,
          frequency: 'Tempo Real / Por Demanda',
          time: 'Rotas: /v1/atas, /v1/atas/atualizacao, /v1/orgaos/{cnpj}/compras',
          timezone: 'America/Sao_Paulo (UTC-3)',
          last_run: new Date().toISOString(),
          next_run: 'Ativo'
        }
      },
      {
        id: 'source-comprasgov',
        name: 'Compras.gov.br',
        type: 'Portal Federal Oficial',
        status: 'Arquitetura Pronta',
        baseUrl: 'https://cnetmobile.estaleiro.serpro.gov.br',
        lastSync: 'Fase futura',
        lastSuccess: null,
        nextSync: 'Planejado',
        capturedCount: 0,
        newCount: 0,
        relevantCount: 0,
        errorCount: 0,
        isActive: false,
        schedule: {
          enabled: false,
          frequency: 'Diário',
          time: '08:00',
          timezone: 'America/Sao_Paulo (UTC-3)',
          last_run: null,
          next_run: 'Fase 16'
        }
      }
    ];

    this.save(initial);
    return initial;
  }

  save(data) {
    try {
      this.sources = data;
      localStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Erro ao salvar fontes:', e);
    }
  }

  getAll() {
    return [...this.sources];
  }

  getById(id) {
    return this.sources.find(s => s.id === id || s.name.toLowerCase() === id.toLowerCase()) || null;
  }

  update(id, updatedFields) {
    const idx = this.sources.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.sources[idx] = { ...this.sources[idx], ...updatedFields };
    this.save(this.sources);
    return this.sources[idx];
  }
}

export const sourceRepository = new SourceRepository();
