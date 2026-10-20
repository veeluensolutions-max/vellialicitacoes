/**
 * VELLIA LICITAÇÕES — FASE 62: PARTNER & CONSORTIUM INTELLIGENCE
 * partnerStrategyModels.js: Enums, Modelos e Estruturas Estratégicas de Parcerias e Consórcios
 * 
 * Princípio Central:
 * Parceria não deve ser recomendada apenas porque existe um gap.
 * A análise considera rigorosamente: regra do edital, capacidade própria, documentação,
 * preço, risco, disponibilidade, histórico e complexidade de governança.
 */

// 5. Tipos de Estrutura de Participação
export const ParticipationType = {
  SOLO: 'Solo',                         // Execução 100% própria com equipe e acervo internos
  PARTNER_SUPPORT: 'Partner Support',   // Apoio pontual de fornecedor homologado (ex: cotação/locação)
  SUBCONTRACTING: 'Subcontracting',     // Subcontratação formal de parcela técnica permitida pelo edital
  CONSORTIUM: 'Consortium',             // Consórcio de empresas com compartilhamento de habilitação
  TO_EVALUATE: 'To Evaluate'            // Em avaliação preliminar de viabilidade
};

// 8. Status da Estrutura de Participação
export const ParticipationStructureStatus = {
  DRAFT: 'Draft',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  SUPERSEDED: 'Superseded' // 9. Versões anteriores nunca são sobrescritas
};

// 17 e 18. Regras de Edital (Consórcio e Subcontratação)
export const EditalRuleStatus = {
  ALLOWED: 'Allowed',           // Permitido expressamente
  NOT_ALLOWED: 'Not Allowed',   // Expressamente vedado
  CONDITIONAL: 'Conditional',   // Permitido sob condições específicas (limite %, categorias)
  UNCLEAR: 'Unclear'            // Cláusula ambígua -> 16. Exige "Revisão jurídica recomendada"
};

// 11. Categorias de Gaps Operacionais e Habilitatórios (Fase 44)
export const GapCategory = {
  TECHNICAL_CAPACITY: 'Technical Capacity',         // CAT / Atestado de serviço específico
  QUANTITATIVE_CAPACITY: 'Quantitative Capacity',   // Volume mínimo exigido (ex: m³, horas, medições)
  TEAM: 'Team',                                     // Especialista/PH dedicado não disponível
  EQUIPMENT: 'Equipment',                           // Instrumento ou máquina específica
  CERTIFICATION: 'Certification',                   // ISO 17025, INMETRO, OHSAS
  REGIONAL_PRESENCE: 'Regional Presence',           // Base operacional no estado ou raio de atuação
  PARTNER_REQUIREMENT: 'Partner Requirement'        // Exigência direta do contratante
};

// 48. Papéis do Parceiro na Parceria / Consórcio
export const PartnerRole = {
  LEAD: 'Empresa Líder (Lead Consorciada)',
  TECHNICAL_PARTNER: 'Parceiro Técnico Habilitatório',
  OPERATIONAL_PARTNER: 'Parceiro Operacional / Apoio de Campo',
  SPECIALIST: 'Especialista / Consultoria Técnica',
  SUBCONTRACTOR: 'Subcontratada Autorizada'
};

// 54. Modelos de Estrutura Comercial
export const CommercialStructureType = {
  FIXED_COST: 'Custo Fixo por Etapa / Item',
  PERCENTAGE: 'Percentual do Faturamento Bruto',
  REVENUE_SHARE: 'Partilha de Receita e Margem (Consórcio)',
  CUSTOM: 'Estrutura Personalizada sob Medição'
};

// 56. Status dos Termos Comerciais
export const CommercialTermsStatus = {
  DRAFT: 'Rascunho Inicial',
  NEGOTIATING: 'Em Negociação',
  AGREED: 'Acordo Fechado' // 57. NUNCA considerado Agreed sem confirmação humana expressa
};

// 83. Status de Confirmação do Parceiro para Oportunidade Específica
export const PartnerConfirmationStatus = {
  NOT_CONTACTED: 'Não Contatado',
  CONTACTED: 'Contatado (Aguardando Resposta)',
  INTERESTED: 'Interesse Manifestado',
  CONFIRMED: 'Confirmado com Evidência',
  UNAVAILABLE: 'Indisponível / Sem Capacidade'
};

// 111. Status do Compromisso Formal do Parceiro (PartnerCommitment)
export const PartnerCommitmentStatus = {
  DRAFT: 'Minuta de Compromisso',
  PENDING: 'Pendente de Assinatura/Confirmação',
  CONFIRMED: 'Compromisso Formal Confirmado',
  WITHDRAWN: 'Retirado / Desistência Declarada', // 115. Dispara recálculo imediato de readiness
  EXPIRED: 'Compromisso Expirado'
};

// 113. Tipos de Evidência de Compromisso
export const CommitmentEvidenceType = {
  EMAIL: 'E-mail Formal de Aceite do Diretor/Gestor',
  DECLARATION: 'Declaração de Compromisso Firmada',
  AGREEMENT: 'MOU / Acordo Pré-Consorcial Assinado',
  OTHER: 'Outro Documento Comprobatório Auditado'
};

// 99 e 100. Nível de Complexidade de Governança
export const GovernanceComplexity = {
  LOW: 'Baixa Complexidade',
  MEDIUM: 'Complexidade Moderada',
  HIGH: 'Alta Complexidade (Múltiplas Partes/Dependência Cruzada)'
};

// 107. Nível de Exclusividade do Parceiro para o Certame
export const ExclusivityType = {
  NONE: 'Sem Exclusividade (Parceiro pode cotar para terceiros)',
  REQUESTED: 'Exclusividade Solicitada Formalmente',
  AGREED: 'Exclusividade Pactuada e Confirmada',
  UNKNOWN: 'Condição de Exclusividade Não Informada'
};

// 34. Dimensões Multidimensionais de Risco do Parceiro (Sem score único)
export const RiskDimension = {
  DEPENDENCY_RISK: 'Risco de Dependência Exclusiva',
  AVAILABILITY_RISK: 'Risco de Disponibilidade e Alocação',
  DOCUMENTATION_RISK: 'Risco de Validade Documental / Certidões',
  PERFORMANCE_RISK: 'Risco de Execução e Qualidade Técnica',
  COMMERCIAL_RISK: 'Risco Comercial e Variação de Preço'
};
