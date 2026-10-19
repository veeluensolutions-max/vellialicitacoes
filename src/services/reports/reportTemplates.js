/**
 * VELLIA LICITAÇÕES — FASE 41
 * DEFINIÇÃO DE TIPOS, TEMPLATES E BRANDING DE RELATÓRIOS
 * 
 * Princípios Centrais:
 * - Toda informação factual provém de dados estruturados ou documentos oficiais.
 * - Formatação estrita sem raw nulls (campos ausentes viram "Não informado").
 * - Identidade visual multiempresa com segregação entre Veeluen Solutions e Excelência Ambiental.
 */

export const ReportType = {
  OPPORTUNITY_EXECUTIVE_SUMMARY: 'OPPORTUNITY_EXECUTIVE_SUMMARY',
  GO_NO_GO_REPORT: 'GO_NO_GO_REPORT',
  EDITAL_ANALYSIS_REPORT: 'EDITAL_ANALYSIS_REPORT',
  HABILITATION_REPORT: 'HABILITATION_REPORT',
  DOSSIER_REPORT: 'DOSSIER_REPORT',
  PROPOSAL_REPORT: 'PROPOSAL_REPORT',
  RESULT_POST_MORTEM_REPORT: 'RESULT_POST_MORTEM_REPORT',
  MARKET_INTELLIGENCE_REPORT: 'MARKET_INTELLIGENCE_REPORT',
  COMPETITOR_REPORT: 'COMPETITOR_REPORT',
  CONTRACT_REPORT: 'CONTRACT_REPORT',
  MEETING_BRIEFING: 'MEETING_BRIEFING',
  EXECUTIVE_BRIEFING: 'EXECUTIVE_BRIEFING',
  STRATEGIC_PLAN_REPORT: 'STRATEGIC_PLAN_REPORT',
  FINANCIAL_PIPELINE_REPORT: 'FINANCIAL_PIPELINE_REPORT',
  EXECUTION_READINESS_REPORT: 'EXECUTION_READINESS_REPORT',
  QUOTATION_MAP_REPORT: 'QUOTATION_MAP_REPORT',
  EXTERNAL_DEPENDENCIES_REPORT: 'EXTERNAL_DEPENDENCIES_REPORT',
  CONTRACT_RISK_REPORT: 'CONTRACT_RISK_REPORT',
  PRE_SIGNATURE_REPORT: 'PRE_SIGNATURE_REPORT',
  CONTRACT_PERFORMANCE_REPORT: 'CONTRACT_PERFORMANCE_REPORT',
  LESSONS_LEARNED_REPORT: 'LESSONS_LEARNED_REPORT',
  CONTRACT_CLOSURE_REPORT: 'CONTRACT_CLOSURE_REPORT',
  DATA_QUALITY_REPORT: 'DATA_QUALITY_REPORT'
};

export const ReportStatus = {
  DRAFT: 'DRAFT',
  GENERATING: 'GENERATING',
  READY_FOR_REVIEW: 'READY_FOR_REVIEW',
  READY_WITH_WARNINGS: 'READY_WITH_WARNINGS',
  APPROVED: 'APPROVED',
  ARCHIVED: 'ARCHIVED',
  FAILED: 'FAILED'
};

export const SecurityClassification = {
  INTERNAL_USE: 'Uso Interno',
  CONFIDENTIAL: 'Confidencial',
  EXECUTIVE_RESTRICTED: 'Restrito à Diretoria'
};

export const COMPANY_BRANDING = {
  Veeluen: {
    id: 'Veeluen',
    name: 'Veeluen Solutions Ltda.',
    tradeName: 'Veeluen Solutions',
    cnpj: '45.123.890/0001-12',
    accentColor: '#0284C7',
    headerBg: '#0F172A',
    logoSvgText: 'VEELUEN SOLUTIONS',
    tagline: 'Engenharia, Soluções Ambientais e O&M Industrial',
    address: 'Recife / PE — Brasil',
    confidentialityNotice: 'Documento de propriedade da Veeluen Solutions. Distribuição restrita a usuários autorizados.'
  },
  Excelencia: {
    id: 'Excelencia',
    name: 'Excelência Ambiental & Engenharia S/A',
    tradeName: 'Excelência Ambiental',
    cnpj: '28.910.345/0001-77',
    accentColor: '#059669',
    headerBg: '#064E3B',
    logoSvgText: 'EXCELÊNCIA AMBIENTAL',
    tagline: 'Monitoramento de Emissões, Gestão de ETEs e Licenciamento',
    address: 'Ipojuca / PE — Brasil',
    confidentialityNotice: 'Documento confidencial emitido por Excelência Ambiental. Proibida reprodução não autorizada.'
  }
};

export const INITIAL_TEMPLATES = [
  {
    id: 'TMPL-OPP-SUMMARY',
    type: ReportType.OPPORTUNITY_EXECUTIVE_SUMMARY,
    title: 'Resumo Executivo de Oportunidade',
    description: 'Síntese executiva para rápida avaliação de edital, requisitos de capacidade, estimativas de valor e prazos.',
    targetFormat: 'PDF',
    securityDefault: SecurityClassification.INTERNAL_USE,
    version: '1.2',
    sections: [
      { id: 'sec-header', title: 'Identificação do Certame', isMandatory: true, sourceField: 'opportunity' },
      { id: 'sec-scope', title: 'Objeto & Escopo Contratual', isMandatory: true, sourceField: 'scope' },
      { id: 'sec-adherence', title: 'Aderência Técnica & Equipe', isMandatory: true, sourceField: 'semanticMatch' },
      { id: 'sec-attestations', title: 'Atestados & Capacidade Comprovada', isMandatory: true, sourceField: 'capacity' },
      { id: 'sec-pricing', title: 'Parâmetros Financeiros & Preço Estimado', isMandatory: false, sourceField: 'pricing', isFinancial: true },
      { id: 'sec-risks', title: 'Matriz de Riscos & Blockers', isMandatory: true, sourceField: 'risks' },
      { id: 'sec-recommendation', title: 'Recomendação do Sistema & Próximos Passos', isMandatory: true, isEditable: true }
    ]
  },
  {
    id: 'TMPL-GO-NO-GO',
    type: ReportType.GO_NO_GO_REPORT,
    title: 'Relatório Formal de Decisão Go/No-Go',
    description: 'Instrumento oficial de deliberação do comitê com registro de votos, alçadas, margem protegida e justificativa.',
    targetFormat: 'PDF',
    securityDefault: SecurityClassification.CONFIDENTIAL,
    version: '2.0',
    sections: [
      { id: 'sec-certame', title: 'Dados Oficiais da Licitação', isMandatory: true },
      { id: 'sec-deliberation', title: 'Deliberação do Comitê de Licitações', isMandatory: true, isEditable: true },
      { id: 'sec-financial-guard', title: 'Floor Price & Margem Aprovada', isMandatory: true, isFinancial: true },
      { id: 'sec-mitigations', title: 'Mitigação de Riscos & Condicionantes', isMandatory: true, isEditable: true },
      { id: 'sec-signoff', title: 'Assinaturas & Alçada Formal de Diretoria', isMandatory: true }
    ]
  },
  {
    id: 'TMPL-POST-MORTEM',
    type: ReportType.RESULT_POST_MORTEM_REPORT,
    title: 'Relatório Pós-Licitação & Lições Aprendidas (Post-Mortem)',
    description: 'Diagnóstico estruturado de resultado pós-sessão, confrontando nossa proposta com os vencedores e concorrentes.',
    targetFormat: 'PDF',
    securityDefault: SecurityClassification.INTERNAL_USE,
    version: '1.0',
    sections: [
      { id: 'sec-result-summary', title: 'Resultado Homologado', isMandatory: true },
      { id: 'sec-bidding-dynamic', title: 'Comportamento da Disputa e Lances', isMandatory: true },
      { id: 'sec-competitor-behavior', title: 'Análise do Vencedor e Descontos Praticados', isMandatory: true },
      { id: 'sec-lessons', title: 'Lições Aprendidas & Recomendações Futuras', isMandatory: true, isEditable: true }
    ]
  },
  {
    id: 'TMPL-EXECUTIVE-BRIEFING',
    type: ReportType.EXECUTIVE_BRIEFING,
    title: 'Briefing Executivo Curto (One-Pager)',
    description: 'Documento ultrassintético de 1 página contendo apenas os dados vitais para decisão de Diretoria.',
    targetFormat: 'PDF',
    securityDefault: SecurityClassification.EXECUTIVE_RESTRICTED,
    version: '1.5',
    sections: [
      { id: 'sec-context-why', title: 'Contexto & Por que Importa', isMandatory: true },
      { id: 'sec-key-numbers', title: 'Números Principais & Teto', isMandatory: true },
      { id: 'sec-critical-decision', title: 'Decisão Necessária & Prazos Críticos', isMandatory: true, isEditable: true }
    ]
  },
  {
    id: 'TMPL-STRATEGIC-PLAN',
    type: ReportType.STRATEGIC_PLAN_REPORT,
    title: 'Relatório Executivo de Planejamento Estratégico',
    description: 'Documento completo de diretrizes, metas, matriz de portfólio, horizontes e riscos para o ciclo anual de licitações.',
    targetFormat: 'PDF',
    securityDefault: SecurityClassification.CONFIDENTIAL,
    version: '1.0',
    sections: [
      { id: 'sec-exec-summary', title: 'Resumo Executivo do Plano', isMandatory: true },
      { id: 'sec-portfolio-matrix', title: 'Portfólio & Matriz de Serviços', isMandatory: true },
      { id: 'sec-geographic-markets', title: 'Mercados & Estratégia Regional', isMandatory: true },
      { id: 'sec-strategic-buyers', title: 'Carteira de Compradores & Account Coverage', isMandatory: true },
      { id: 'sec-contracts-expiry', title: 'Contratos em Vencimento & Renovações', isMandatory: true },
      { id: 'sec-goals-scorecard', title: 'Metas Estratégicas (Plan vs Actual)', isMandatory: true },
      { id: 'sec-concentration-risks', title: 'Diagnóstico de Risco de Concentração', isMandatory: true },
      { id: 'sec-action-horizons', title: 'Plano de Ação por Horizonte (90d, 180d, 12m)', isMandatory: true, isEditable: true }
    ]
  },
  {
    id: 'TMPL-FINANCIAL-PIPELINE',
    type: ReportType.FINANCIAL_PIPELINE_REPORT,
    title: 'Relatório Financeiro do Pipeline & Forecast',
    description: 'Diagnóstico estruturado de valor bruto, qualificado, ponderado, margem potencial, valor em risco e concentração.',
    targetFormat: 'PDF',
    securityDefault: SecurityClassification.CONFIDENTIAL,
    version: '1.0',
    sections: [
      { id: 'sec-pipeline-overview', title: 'Visão Geral & Data Coverage do Pipeline', isMandatory: true },
      { id: 'sec-maturity-breakdown', title: 'Maturidade & Forecast (Commit, Best Case, Ponderado)', isMandatory: true },
      { id: 'sec-margin-potential', title: 'Margem Potencial & Faixas de Rentabilidade', isMandatory: true, isFinancial: true },
      { id: 'sec-risk-without-double-count', title: 'Valor em Risco (Sem Dupla Contagem)', isMandatory: true },
      { id: 'sec-concentration-exposure', title: 'Concentração por Comprador & Single Opportunity Exposure', isMandatory: true },
      { id: 'sec-target-gap-coverage', title: 'Atingimento de Metas & Gap de Fechamento', isMandatory: true },
      { id: 'sec-what-if-scenarios', title: 'Simulações What-If & Análise de Sensibilidade', isMandatory: true, isEditable: true }
    ]
  },
  {
    id: 'TMPL-EXECUTION-READINESS',
    type: ReportType.EXECUTION_READINESS_REPORT,
    title: 'Relatório de Prontidão Operacional & Capacidade de Execução',
    description: 'Diagnóstico multidimensional de prontidão de equipe, equipamentos, calibrações RBC, certificações, agenda, parceiros e gaps operacionais.',
    targetFormat: 'PDF',
    securityDefault: SecurityClassification.CONFIDENTIAL,
    version: '1.0',
    sections: [
      { id: 'sec-readiness-overview', title: 'Visão Geral da Oportunidade & Fit Operacional', isMandatory: true },
      { id: 'sec-service-requirements', title: 'Requisitos Operacionais Configurados por Serviço', isMandatory: true },
      { id: 'sec-team-allocation', title: 'Disponibilidade, Competências & Alocação de Equipe', isMandatory: true },
      { id: 'sec-equipment-metrology', title: 'Parque de Equipamentos Técnicos & Calibrações RBC', isMandatory: true },
      { id: 'sec-certifications-validity', title: 'Certificações Técnicas & Validade Durante o Contrato', isMandatory: true },
      { id: 'sec-schedule-conflicts', title: 'Agenda Operacional & Conflitos com Contratos Vigentes', isMandatory: true },
      { id: 'sec-partner-dependencies', title: 'Dependência de Parceiros Acreditados & Terceirização', isMandatory: true },
      { id: 'sec-gaps-action-plan', title: 'Matriz de Gaps Operacionais, Prazos & Planos de Mitigação', isMandatory: true, isEditable: true },
      { id: 'sec-pre-contract-validation', title: 'Parecer Final de Prontidão & Handoff Pré-Contratual', isMandatory: true }
    ]
  },
  {
    id: 'TMPL-QUOTATION-MAP',
    type: ReportType.QUOTATION_MAP_REPORT,
    title: 'Mapa de Cotações & Comparativo de Fornecedores',
    description: 'Diagnóstico estruturado de cotações recebidas, comparação de escopos, frete, coleta, prazos, validade e justificativa da cotação selecionada.',
    targetFormat: 'PDF',
    securityDefault: SecurityClassification.CONFIDENTIAL,
    version: '1.0',
    sections: [
      { id: 'sec-quote-context', title: 'Identificação da Oportunidade & Categoria Solicitada', isMandatory: true },
      { id: 'sec-quotes-comparison-table', title: 'Matriz Comparativa de Cotações Lado a Lado', isMandatory: true, isFinancial: true },
      { id: 'sec-scope-equivalence-audit', title: 'Auditoria de Equivalência de Escopo (Frete, Coleta e Insumos)', isMandatory: true },
      { id: 'sec-validity-status', title: 'Controle de Validade & Prazos de Resposta', isMandatory: true },
      { id: 'sec-selected-quotation', title: 'Cotação Homologada & Impacto na Formação de Preço', isMandatory: true, isFinancial: true },
      { id: 'sec-supplier-evaluations', title: 'Avaliação Qualitativa do Fornecedor & Histórico', isMandatory: true }
    ]
  },
  {
    id: 'TMPL-EXTERNAL-DEPENDENCIES',
    type: ReportType.EXTERNAL_DEPENDENCIES_REPORT,
    title: 'Relatório de Dependências Externas & Risco de Fornecedor Único',
    description: 'Mapeamento consolidado de terceiros, dependências críticas, cobertura de custos externos (confirmado vs estimado) e análise de single source.',
    targetFormat: 'PDF',
    securityDefault: SecurityClassification.CONFIDENTIAL,
    version: '1.0',
    sections: [
      { id: 'sec-external-dependencies-overview', title: 'Visão Geral de Dependências da Oportunidade', isMandatory: true },
      { id: 'sec-single-source-analysis', title: 'Análise de Risco de Fornecedor Único (Single Source)', isMandatory: true },
      { id: 'sec-cost-certainty-matrix', title: 'Matriz de Incerteza de Custos (Confirmado, Estimado, Sem Cotação)', isMandatory: true, isFinancial: true },
      { id: 'sec-backup-partners', title: 'Plano de Contingência & Parceiros Alternativos', isMandatory: true },
      { id: 'sec-post-win-revalidation-plan', title: 'Protocolo de Revalidação de Cotações Pós-Vitória', isMandatory: true }
    ]
  },
  {
    id: 'TMPL-CONTRACT-RISK',
    type: ReportType.CONTRACT_RISK_REPORT,
    title: 'Relatório de Risco Contratual & Obrigações Pós-Vitória',
    description: 'Resumo executivo, matriz de obrigações, riscos mapeados, multas, SLA, garantias, mobilização, mitigações e pendências operacionais.',
    targetFormat: 'PDF',
    securityDefault: SecurityClassification.CONFIDENTIAL,
    version: '1.0',
    sections: [
      { id: 'sec-crr-summary', title: 'Resumo Executivo & Dados Gerais do Contrato', isMandatory: true },
      { id: 'sec-crr-obligations', title: 'Obrigações Estruturadas & Matriz de Cumprimento', isMandatory: true },
      { id: 'sec-crr-risks', title: 'Mapeamento de Riscos Operacionais & Financeiros', isMandatory: true },
      { id: 'sec-crr-penalties', title: 'Penalidades, Multas & Exposição Contratual Potencial', isMandatory: true, isFinancial: true },
      { id: 'sec-crr-sla', title: 'SLA & Capacidade de Atendimento', isMandatory: true },
      { id: 'sec-crr-guarantees', title: 'Garantias, Seguros & Caução', isMandatory: true },
      { id: 'sec-crr-mobilization', title: 'Mobilização vs Prontidão Operacional', isMandatory: true },
      { id: 'sec-crr-mitigations', title: 'Planos de Mitigação & Pendências Operacionais', isMandatory: true, isEditable: true }
    ]
  },
  {
    id: 'TMPL-PRE-SIGNATURE',
    type: ReportType.PRE_SIGNATURE_REPORT,
    title: 'Relatório Pré-Assinatura (Board View Executivo)',
    description: 'Resumo ultrassintético para a Diretoria contendo valor, prazo, top riscos, exposição a multas, gaps operacionais e recomendação formal de assinatura.',
    targetFormat: 'PDF',
    securityDefault: SecurityClassification.EXECUTIVE_RESTRICTED,
    version: '1.0',
    sections: [
      { id: 'sec-board-overview', title: 'Visão Geral & Parâmetros do Contrato', isMandatory: true },
      { id: 'sec-board-top-risks', title: 'Top Riscos Operacionais & Financeiros', isMandatory: true },
      { id: 'sec-board-exposure', title: 'Exposição Contratual Teórica a Penalidades', isMandatory: true, isFinancial: true },
      { id: 'sec-board-gaps', title: 'Contract Diff & Gaps de Mobilização/Subcontratação', isMandatory: true },
      { id: 'sec-board-recommendation', title: 'Recomendação Formal & Acceptance Gate', isMandatory: true, isEditable: true }
    ]
  },
  {
    id: 'TMPL-CONTRACT-PERFORMANCE',
    type: ReportType.CONTRACT_PERFORMANCE_REPORT,
    title: 'Relatório de Performance Contratual & Aprendizado (Fase 47)',
    description: 'Diagnóstico estruturado de execução real, planejado vs observado, confrontação de riscos, performance de fornecedores e aprendizados sem dados contábeis inventados.',
    targetFormat: 'PDF',
    securityDefault: SecurityClassification.EXECUTIVE_RESTRICTED,
    version: '1.0',
    sections: [
      { id: 'sec-perf-dimensions', title: 'Avaliação Multidimensional (Comercial, Operacional, Risco e Parceiros)', isMandatory: true },
      { id: 'sec-perf-planned-vs-actual', title: 'Planejado vs Observado (Margem Operacional & Custos Estratégicos)', isMandatory: true, isFinancial: true },
      { id: 'sec-perf-risks', title: 'Riscos Realizados & Eficácia das Mitigações', isMandatory: true },
      { id: 'sec-perf-partners', title: 'Desempenho de Fornecedores & Parceiros (Fatos Observados)', isMandatory: true },
      { id: 'sec-perf-benchmark', title: 'Referência Interna & Alerta de Amostra Pequena', isMandatory: true }
    ]
  },
  {
    id: 'TMPL-LESSONS-LEARNED',
    type: ReportType.LESSONS_LEARNED_REPORT,
    title: 'Relatório Corporativo de Lições Aprendidas & Closed-Loop Learning',
    description: 'Compilado de lições de execução aprovadas pela Diretoria com impactos em precificação, risco, prontidão e habilitação futura.',
    targetFormat: 'PDF',
    securityDefault: SecurityClassification.INTERNAL_USE,
    version: '1.0',
    sections: [
      { id: 'sec-lessons-summary', title: 'Resumo Executivo do Repositório de Aprendizado', isMandatory: true },
      { id: 'sec-lessons-approved', title: 'Lições Aprovadas & Reusabilidade em Novas Propostas', isMandatory: true },
      { id: 'sec-lessons-deviations', title: 'Causas Raiz de Desvios Históricos Registrados', isMandatory: true },
      { id: 'sec-lessons-governance', title: 'Trilha de Governança e Aprovações de Regras', isMandatory: true }
    ]
  },
  {
    id: 'TMPL-CONTRACT-CLOSURE',
    type: ReportType.CONTRACT_CLOSURE_REPORT,
    title: 'Relatório de Encerramento Contratual & Capability Growth',
    description: 'Dossiê final de conclusão contratual, checklist de obrigações, lições consolidadas e identificação de novos atestados / CAT para fortalecimento de acervo.',
    targetFormat: 'PDF',
    securityDefault: SecurityClassification.CONFIDENTIAL,
    version: '1.0',
    sections: [
      { id: 'sec-closure-checklist', title: 'Checklist Formal de Encerramento & Pendências', isMandatory: true },
      { id: 'sec-closure-post-mortem', title: 'Resumo Post-Mortem de Resultados Operacionais', isMandatory: true },
      { id: 'sec-closure-capability', title: 'Capability Loop (Potencial de Atestado / ART / CAT)', isMandatory: true },
      { id: 'sec-closure-renewal', title: 'Sinais de Renovação & Oportunidades de Cross-Sell', isMandatory: true }
    ]
  },
  {
    id: 'TMPL-DATA-QUALITY',
    type: ReportType.DATA_QUALITY_REPORT,
    title: 'Relatório de Qualidade de Dados & Governança da Informação',
    description: 'Auditoria técnica de confiabilidade da base Vellia: integridade de proveniência, frescor, detecção de conflitos, deduplicações e saúde dos conectores.',
    targetFormat: 'PDF',
    securityDefault: SecurityClassification.INTERNAL_USE,
    version: '1.0',
    sections: [
      { id: 'sec-dq-summary', title: 'Diagnóstico Geral da Saúde dos Dados (4 Dimensões)', isMandatory: true },
      { id: 'sec-dq-conflicts', title: 'Inventário de Conflitos & Divergências de Fontes', isMandatory: true },
      { id: 'sec-dq-dedup', title: 'Entity Resolution & Deduplicações de Cadastros', isMandatory: true },
      { id: 'sec-dq-connectors', title: 'Observabilidade de Conectores & Portais Externos', isMandatory: true },
      { id: 'sec-dq-lineage', title: 'Rastreabilidade de Decisões Críticas (Quality Gates)', isMandatory: true }
    ]
  }
];

export const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return 'Não informado';
  return `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDateBR = (isoDate) => {
  if (!isoDate) return 'Não informado';
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('pt-BR');
  } catch (e) {
    return 'Não informado';
  }
};
