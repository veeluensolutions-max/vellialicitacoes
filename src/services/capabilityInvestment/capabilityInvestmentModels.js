/**
 * VELLIA LICITAÇÕES — FASE 69: STRATEGIC INVESTMENT & CAPABILITY EXPANSION PLANNER
 * capabilityInvestmentModels.js: Modelos Canônicos, Enums e Estruturas de Investimento em Capacidade
 */

export const SignalType = {
  REPEATED_EQUIPMENT_BOTTLENECK: 'Gargalo Recorrente de Equipamento',
  REPEATED_STAFF_GAP: 'Gargalo Recorrente de Equipe/Função',
  CERTIFICATION_GAP: 'Lacuna Recorrente de Habilitação Técnica',
  PARTNER_DEPENDENCY: 'Dependência Crítica de Parceiro Subcontratado',
  REGIONAL_CAPACITY_GAP: 'Lacuna de Presença / Capacidade Regional',
  SUPPLIER_DEPENDENCY: 'Dependência de Fornecedor / Insumo Exclusivo',
  OPERATIONAL_THROUGHPUT_CONSTRAINT: 'Gargalo de Vazão / Capacidade Produtiva'
};

export const CapabilityType = {
  EQUIPMENT: 'Equipamento Especializado',
  PEOPLE: 'Recursos Humanos / Equipe',
  TRAINING: 'Treinamento / Qualificação Interna',
  CERTIFICATION: 'Certificação / Habilitação Institucional',
  PARTNER_NETWORK: 'Rede de Parcerias Estratégicas',
  SUPPLIER_CAPACITY: 'Capacidade de Fornecedores',
  REGIONAL_PRESENCE: 'Presença e Base Operacional Regional',
  OPERATIONAL_INFRASTRUCTURE: 'Infraestrutura Operacional Física',
  TECHNOLOGY: 'Tecnologia & Instrumentação Analítica'
};

export const InvestmentCaseStatus = {
  IDENTIFIED: 'Identified (Sinal Identificado)',
  UNDER_ANALYSIS: 'Under Analysis (Em Modelagem de Alternativas)',
  SCENARIO_READY: 'Scenario Ready (Cenários Prontos para Diretoria)',
  UNDER_REVIEW: 'Under Review (Em Deliberação no Comitê)',
  APPROVED: 'Approved (Aprovado Formalmente - Aguardando Aquisição)',
  REJECTED: 'Rejected (Rejeitado com Justificativa)',
  DEFERRED: 'Deferred (Postergado para Próximo Ciclo)',
  IMPLEMENTED: 'Implemented (Implementado e Auditado em Campo)',
  ARCHIVED: 'Archived (Arquivado)'
};

export const ExpansionOptionType = {
  BUY: 'Buy (Aquisição Própria / Capex)',
  RENT: 'Rent (Locação Comercial / Opex)',
  HIRE: 'Hire (Contratação de Profissional)',
  TRAIN: 'Train (Treinamento / Capacitação Interna)',
  CERTIFY: 'Certify (Certificação Formal)',
  OUTSOURCE: 'Outsource (Terceirização de Serviço)',
  PARTNER: 'Partner (Acordo Operacional de Parceria)',
  REALLOCATE: 'Reallocate (Reorganização de Processo / Escalonamento)',
  DO_NOTHING: 'Do Nothing (Manter Situação Atual / Não Investir)'
};

export const CostSourceType = {
  QUOTATION: 'Cotação Formal de Fornecedor',
  HISTORICAL: 'Base Histórica de Contratações Anteriores',
  SUPPLIER_PROPOSAL: 'Proposta Comercial Firme',
  MANUAL_ASSUMPTION: 'Premissa Manual do Gestor',
  UNKNOWN: 'Desconhecido / Em Levantamento'
};

export const RootConstraintType = {
  CAPACITY_SHORTAGE: 'Falta Real de Ativos (Capacity Shortage)',
  AVAILABILITY_ISSUE: 'Indisponibilidade Temporária',
  SCHEDULING_ISSUE: 'Gargalo de Agendamento / Processo Interno',
  CERTIFICATION_ISSUE: 'Exigência Específica de Habilitação',
  MAINTENANCE_ISSUE: 'Parada Preventiva / Calibração Vencida',
  GEOGRAPHIC_ISSUE: 'Distância Geográfica / Logística de Mobilização'
};

export const CapitalPriorityTier = {
  NOW: 'Now (Investimento Imediato Obrigatório)',
  PREPARE: 'Prepare (Estruturar Pré-requisitos & Cotações)',
  MONITOR: 'Monitor (Acompanhar Persistência da Demanda)',
  DO_NOT_PURSUE: 'Do Not Pursue (Não Perseguir neste Ciclo)'
};

export const PostInvestmentReviewPeriod = {
  THREE_MONTHS: '3 Meses Pós-Implementação',
  SIX_MONTHS: '6 Meses Pós-Implementação',
  TWELVE_MONTHS: '12 Meses Pós-Implementação'
};
