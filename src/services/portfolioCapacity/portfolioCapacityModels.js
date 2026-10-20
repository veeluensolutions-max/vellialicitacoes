/**
 * VELLIA LICITAÇÕES — FASE 68: STRATEGIC RESOURCE OPTIMIZATION + PORTFOLIO TRADEOFF ENGINE
 * portfolioCapacityModels.js: Modelos Canônicos, Enums e Tipos de Capacidade Estratégica
 */

export const ResourceType = {
  PEOPLE_ROLE: 'People Role (Papel/Função)',
  TEAM: 'Team (Equipe Operacional)',
  EQUIPMENT: 'Equipment (Equipamento Especializado)',
  VEHICLE: 'Vehicle (Veículo Operacional)',
  INSTRUMENT: 'Instrument (Instrumento de Medição)',
  CERTIFICATION: 'Certification (Habilitação/Certificação)',
  PARTNER_CAPACITY: 'Partner Capacity (Capacidade de Parceiro)',
  EXTERNAL_SPECIALIST: 'External Specialist (Especialista Externo)',
  OPERATIONAL_SLOT: 'Operational Slot (Janela de Mobilização)'
};

export const CapacityQuality = {
  CONFIRMED: 'Confirmed (Auditada e Confirmada)',
  ESTIMATED: 'Estimated (Estimada por Histórico)',
  UNKNOWN: 'Unknown (Incerteza / Não Auditada)'
};

export const DemandStatus = {
  POTENTIAL: 'Potential (Pipeline Inicial)',
  EXPECTED: 'Expected (Fase Avançada / Proposta Enviada)',
  COMMITTED: 'Committed (Contrato Assinado / Oportunidade Homologada)',
  CANCELLED: 'Cancelled (Cancelada / Perdida)'
};

export const DemandConfidence = {
  HIGH: 'High (Alta Certeza)',
  MEDIUM: 'Medium (Média Certeza)',
  LOW: 'Low (Incerteza)'
};

export const ResourcePressureLevel = {
  AVAILABLE: 'Available (Folga Operacional)',
  BALANCED: 'Balanced (Equilibrada)',
  STRESSED: 'Stressed (Sob Tensão)',
  CRITICAL: 'Critical (Sobrecarga / Conflito Crítico)'
};

export const ConflictType = {
  TEAM_CONFLICT: 'Team Conflict (Disputa de Equipe)',
  EQUIPMENT_CONFLICT: 'Equipment Conflict (Disputa de Equipamento)',
  CERTIFICATION_CONFLICT: 'Certification Conflict (Profissional Habilitado Exclusivo)',
  PARTNER_CONFLICT: 'Partner Conflict (Dependência de Mesmo Parceiro)',
  SCHEDULE_CONFLICT: 'Schedule Conflict (Janela Temporal Sobreposta)',
  REGIONAL_CONFLICT: 'Regional Conflict (Distância de Mobilização Simultânea)'
};

export const ConflictStatus = {
  DETECTED: 'Detected (Detectado)',
  UNDER_REVIEW: 'Under Review (Em Análise pelo Comitê)',
  MITIGATED: 'Mitigated (Mitigado com Terceirização/Ajuste)',
  ACCEPTED: 'Accepted (Risco Aceito Conscientemente)',
  RESOLVED: 'Resolved (Conflito Eliminado)'
};

export const ReservationStatus = {
  TENTATIVE: 'Tentative (Reserva Provisória de Oportunidade)',
  APPROVED: 'Approved (Aprovada pelo Gestor de Recursos)',
  COMMITTED: 'Committed (Comprometida com Contrato)',
  RELEASED: 'Released (Liberada / Expirada)'
};

export const OpportunityPriorityTier = {
  MUST_WIN: 'Must Win (Prioridade Estratégica Absoluta - Humana)',
  STRATEGIC: 'Strategic (Estratégica para Posicionamento)',
  STANDARD: 'Standard (Padrão de Portfólio)',
  LOW_PRIORITY: 'Low Priority (Secundária)'
};

export const TradeoffObjective = {
  BALANCED: 'Crescimento Equilibrado (Balanced Growth)',
  PROTECT_CONTRACTS: 'Blindagem de Contratos Ativos (Protect Existing Contracts)',
  MAXIMIZE_STRATEGIC_FIT: 'Maximização de Posicionamento (Strategic Fit)',
  PROTECT_MARGIN: 'Proteção de Rentabilidade & Margem (Protect Margin)',
  REDUCE_CONCENTRATION: 'Diversificação de Portfólio (Reduce Concentration)'
};
