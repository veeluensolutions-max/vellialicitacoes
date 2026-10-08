/**
 * VELLIA LICITAÇÕES - PETRONECT CONFIGURATION (FASE 6)
 * Parâmetros centralizados de conexão, limites e telemetria da fonte pública Petronect.
 */

export const PETRONECT_CONFIG = {
  PETRONECT_SOURCE_ENABLED: true,
  PETRONECT_SYNC_INTERVAL: 'Diária',
  PETRONECT_DEFAULT_TIME: '06:30',
  PETRONECT_TIMEZONE: 'America/Recife',
  
  // Limites e Resiliência HTTP
  PETRONECT_REQUEST_TIMEOUT: 10000, // 10 segundos
  PETRONECT_MAX_RETRIES: 3,
  PETRONECT_RATE_LIMIT_MS: 500, // Intervalo mínimo entre requisições consecutivas
  PETRONECT_PAGE_SIZE: 20,
  
  // Endpoints Públicos Oficiais (Apenas áreas públicas, sem credenciais)
  PRIMARY_PUBLIC_URL: 'https://www.petronect.com.br/portalpublico/licitacoes',
  SECONDARY_PUBLIC_URL: 'https://www.petronect.com.br/portalpublico/destaques',
  PUBLIC_API_ENDPOINT: 'https://www.petronect.com.br/api/public/oportunidades',

  // Identificação Transparente
  USER_AGENT: 'VelliaLicitacoes/2.0 (Agente Comercial Corporativo; +https://vellia.com.br)',

  // Versões para Auditoria e Rastreabilidade
  CONNECTOR_VERSION: '1.2.0-public',
  PARSER_VERSION: '1.4.0',
  SCORING_VERSION: '2.1.0'
};

export const SourceHealthStatus = {
  ONLINE: 'ONLINE',
  DEGRADED: 'DEGRADED',
  OFFLINE: 'OFFLINE',
  PAUSED: 'PAUSED',
  SYNCING: 'SYNCING'
};
