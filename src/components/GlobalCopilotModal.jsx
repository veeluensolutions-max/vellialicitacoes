import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  Layers,
  Search,
  ExternalLink
} from 'lucide-react';
import { OpportunityService } from '../services/opportunityService';
import { DecisionService } from '../services/decision/decisionService';
import { uxTelemetryService, UxEventType } from '../services/ux/uxTelemetryService';
import { contextualMatchingEngine } from '../services/intelligence/contextualMatchingEngine';
import { marketIntelligenceService } from '../services/market/marketIntelligenceService';
import { nextBestActionService } from '../services/prescriptive/nextBestActionService';
import { comparableOpportunityService } from '../services/pricing/comparableOpportunityService';
import { strategicSimulationService, SCENARIO_TYPES } from '../services/simulation/strategicSimulationService';
import { approvalService } from '../services/governance/approvalService';
import { ApprovalType, ApprovalStatus } from '../services/governance/approvalTypes';
import { workflowEngine } from '../services/automation/workflowEngine';
import { agentControlCenterService } from '../services/agentControl/agentControlCenterService';
import { knowledgeGraphService } from '../services/knowledgeGraph/knowledgeGraphService';
import { reportGenerationService } from '../services/reports/reportGenerationService';
import { strategicPlanningService } from '../services/strategic/strategicPlanningService';
import { financialPipelineService } from '../services/financial/financialPipelineService';
import executionReadinessService from '../services/readiness/executionReadinessService';
import supplierQuotationService from '../services/suppliers/supplierQuotationService';
import { contractRiskService } from '../services/contract/contractRiskService';
import { contractPerformanceService } from '../services/contract/contractPerformanceService';
import { dataGovernanceService } from '../services/dataGovernance/dataGovernanceService';

export default function GlobalCopilotModal({ 
  isOpen, 
  onClose, 
  activeOpportunity, 
  currentModule = 'dashboard',
  onSelectOpportunity 
}) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Inicializa com contexto estruturado
  useEffect(() => {
    if (isOpen) {
      if (activeOpportunity) {
        setMessages([
          {
            sender: 'bot',
            structured: {
              resumo: `Contexto ativo: Edital #${activeOpportunity.id} (${activeOpportunity.client || 'Petrobras'}). Estou pronto para responder sobre conformidade técnica, prazos, riscos e diretrizes de envio.`,
              indicadores: [
                { label: 'Aderência', value: `${activeOpportunity.score || 94}%` },
                { label: 'Prazo', value: `${activeOpportunity.daysLeft || 3} dias` },
                { label: 'Estimativa', value: `R$ ${(activeOpportunity.estimatedValue || 2400000).toLocaleString('pt-BR')}` }
              ],
              pendencias: [
                'Revisar minuta de proposta técnica antes da submissão',
                'Verificar validade da CND Federal no Centro de Capacidade'
              ],
              recomendacao: 'GO COM PENDÊNCIAS — Viabilidade alta, restando apenas conferência cadastral.',
              fontes: 'Baseado em 4 registros do Vellia (Edital Petronect, Dossiê de Habilitação, Catálogo CAT/CREA e Matriz de Riscos).'
            },
            suggestions: [
              'De onde veio este valor?',
              'Esse dado está atualizado?',
              'Existe alguma inconsistência nesta oportunidade?',
              'Quais informações ainda precisam ser confirmadas?',
              'Por que essa análise está marcada como stale?',
              'Se ganharmos esta oportunidade, conseguimos executar?',
              'Qual profissional está disponível?',
              'Existe conflito de equipe?'
            ]
          }
        ]);
      } else {
        setMessages([
          {
            sender: 'bot',
            structured: {
              resumo: `Assistente Vellia em prontidão para o módulo ${currentModule.toUpperCase()}. Monitorando ativamente portais, certidões corporativas e pipeline de propostas com supervisão de agentes e Vellia Intelligence Workspace.`,
              indicadores: [
                { label: 'Oportunidades em Radar', value: '14' },
                { label: 'Sessões de Workspace', value: '1 Ativa' },
                { label: 'Decisão Pronta', value: '1 Certame' }
              ],
              pendencias: [
                '1 proposta vence amanhã (Petrobras Bacia de Santos)',
                '1 sessão de investigação pronta para julgamento GO/NO-GO'
              ],
              recomendacao: 'Acessar a aba "Vellia Intelligence" no menu lateral para investigar.',
              fontes: 'IntelligenceWorkspaceService, KnowledgeGraphService e WorkflowEngine.'
            },
            suggestions: [
              'Quanto temos no pipeline?',
              'Quanto é realmente qualificado?',
              'Quanto está em risco?',
              'Quanto precisamos gerar para atingir a meta?',
              'Quais oportunidades mais impactam o forecast?',
              'Como fica o trimestre se perdermos a oportunidade X?',
              'Quais serviços deveríamos priorizar nos próximos 6 meses?',
              'Gere o resumo executivo desta oportunidade',
              'O que o agente fez hoje?'
            ]
          }
        ]);
      }
    }
  }, [isOpen, activeOpportunity, currentModule]);

  if (!isOpen) return null;

  const handleSend = (textToSend) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    uxTelemetryService.recordEvent(
      UxEventType.COPILOT_QUERY,
      'GlobalCopilotModal',
      { hasContext: !!activeOpportunity, module: currentModule },
      1,
      450
    );

    setTimeout(() => {
      let structuredReply = null;
      const lower = query.toLowerCase();

      // FASE 48: DATA GOVERNANCE + QUALIDADE DE DADOS + CONFIABILIDADE DA INTELIGÊNCIA (Itens 158 a 161)
      if (lower.includes('de onde veio') || lower.includes('de onde vem') || lower.includes('why this value') || lower.includes('origem deste valor') || lower.includes('origem do valor')) {
        const oppId = activeOpportunity?.id || 'OPP-2026-001';
        const why = dataGovernanceService.getWhyThisValue(oppId, 'estimatedValue');
        structuredReply = {
          resumo: `Rastreabilidade de Origem (Data Provenance): O valor estimado da oportunidade (${why.currentValueFormatted || 'R$ 2.450.000,00'}) tem origem registrada no documento "${why.sourceId || 'Edital_Petronect_7004128956.pdf'}", Seção "${why.section || 'Item 7.1 — Orçamento Referencial'}", Pág. ${why.page || 4}. ${why.isConfirmed ? 'Confirmado formalmente por ' + why.confirmedBy + '.' : 'Extraído via IA/Parser com confiança ' + why.confidence + '.'}`,
          indicadores: [
            { label: 'Campo Rastreável', value: 'Opportunity.estimatedValue' },
            { label: 'Tipo de Fonte', value: why.sourceType || 'Documento Oficial' },
            { label: 'Nível de Confiança', value: why.confidence || 'Confirmed' },
            { label: 'Frescor do Dado', value: why.freshness || 'Fresh' }
          ],
          pendencias: [
            why.isManuallyOverridden 
              ? `Ajuste Humano Auditado: Valor original era ${why.originalValueFormatted || 'R$ 2.100.000,00'}, retificado por ${why.overrideBy} em ${new Date(why.overriddenAt).toLocaleDateString('pt-BR')} sob justificativa: "${why.overrideReason}". Original preservado.`
              : `Extração Direta: Método ${why.extractionMethod || 'OCR Estruturado'} executado em ${new Date(why.importedAt || Date.now()).toLocaleDateString('pt-BR')}.`,
            'Qualidade Documental: Edital classificado como Excellent (legibilidade 96%), sem ruído de OCR.'
          ],
          recomendacao: 'Dado auditável e pronto para uso em modelagens de preço e comitê Go/No-Go sem bloqueios de governança.',
          fontes: `DataProvenance [${why.sourceId || 'Edital_Petronect_7004128956.pdf'}, Pág. ${why.page || 4}] — Vellia Data Governance (FASE 48).`
        };
      } else if (lower.includes('esse dado está atualizado') || lower.includes('esse dado esta atualizado') || lower.includes('dado está atualizado') || lower.includes('frescor') || lower.includes('freshness')) {
        const oppId = activeOpportunity?.id || 'OPP-2026-001';
        const health = dataGovernanceService.getEntityDataHealth('Opportunity', oppId);
        structuredReply = {
          resumo: `Auditoria de Frescor do Dado (Data Freshness): A oportunidade #${oppId} possui índice de frescor classificado como "${health.freshness}". O prazo do edital foi revalidado na última sincronização do conector Petronect há 32 minutos. A certidão fiscal atrelada está válida até 28/11/2026.`,
          indicadores: [
            { label: 'Classificação', value: health.freshness },
            { label: 'Última Sync', value: 'Há 32 min (Petronect)' },
            { label: 'Prazo Limite', value: '22/10/2026 às 10:00' },
            { label: 'Certidão Fiscal', value: 'Válida (Fresh)' }
          ],
          pendencias: [
            'Política de Freshness: Prazos de edital são revalidados a cada ciclo de radar. Cotações de insumos possuem validade estrita de 15 dias.',
            'Aviso de Stale: Se algum conector falhar por mais de 24h, o sistema marcará automaticamente como Aging/Stale para proteger a decisão.'
          ],
          recomendacao: 'As informações temporais estão plenamente vigentes para submissão de lances.',
          fontes: 'DataGovernanceService — Motor de Políticas de Freshness e Validade Real (FASE 48).'
        };
      } else if (lower.includes('inconsistência') || lower.includes('inconsistencia') || lower.includes('existe conflito') || lower.includes('conflito de dados') || lower.includes('divergência')) {
        const oppId = activeOpportunity?.id || 'OPP-2026-001';
        const conflicts = dataGovernanceService.getConflicts('Opportunity', oppId);
        const openConflicts = conflicts.filter(c => c.status === 'Open');
        structuredReply = {
          resumo: openConflicts.length > 0 
            ? `Atenção: Detectado ${openConflicts.length} conflito(s) aberto(s) de dados nesta oportunidade. O sistema não sobrescreve silenciosamente e mantém ambos os valores registrados para conferência.`
            : `Consistência Verificada: Nenhuma inconsistência crítica detectada entre as fontes monitoradas para a oportunidade #${oppId}.`,
          indicadores: [
            { label: 'Conflitos Ativos', value: `${openConflicts.length}` },
            { label: 'Prioridade de Fonte', value: 'Adendo > Edital > Portal' },
            { label: 'Consistência', value: openConflicts.length > 0 ? 'Requer Atenção' : '100% Conforme' },
            { label: 'Quality Gate', value: openConflicts.length > 0 ? 'Bloqueio Preventivo' : 'Liberado' }
          ],
          pendencias: openConflicts.length > 0 
            ? openConflicts.map(c => `${c.field}: Fonte A (${c.sourceA.type}) aponta "${c.sourceA.value}", mas Fonte B (${c.sourceB.type}) aponta "${c.sourceB.value}". Resolução sugerida: ${c.sourceA.type.includes('Adendo') ? 'Priorizar Adendo' : 'Revisão Humana'}.`)
            : ['Sem divergências entre PNCP, Petronect e Anexos do Edital.', 'Regra de negócio: Conflitos em prazos e valores bloqueiam o estágio GO até resolução.'],
          recomendacao: openConflicts.length > 0 
            ? 'Acessar a fila de Revisões de Dados no menu "Data Governance" para aprovar o valor definitivo.'
            : 'Dados íntegros e consistentes entre todas as fontes rastreadas.',
          fontes: 'DataConflict Registry — Resolução Hierárquica de Fontes (FASE 48).'
        };
      } else if (lower.includes('precisam ser confirmadas') || lower.includes('informações a confirmar') || lower.includes('o que precisa ser confirmado') || lower.includes('confirmar')) {
        const oppId = activeOpportunity?.id || 'OPP-2026-001';
        const issues = dataGovernanceService.getQualityIssues('Opportunity', oppId);
        const pendingReview = issues.filter(i => i.status === 'Open' || i.status === 'In Review');
        structuredReply = {
          resumo: `Checklist de Confirmação e Quality Gate: Para o avanço da oportunidade #${oppId} rumo aos estágios GO e PROPOSAL, existem ${pendingReview.length} itens pendentes de validação formal por operadores humanos.`,
          indicadores: [
            { label: 'Pendências Críticas', value: `${pendingReview.filter(p => p.severity === 'Critical').length}` },
            { label: 'Pendências Altas', value: `${pendingReview.filter(p => p.severity === 'High').length}` },
            { label: 'Total a Confirmar', value: `${pendingReview.length}` },
            { label: 'Estágio Alvo', value: 'QUALIFIED → GO' }
          ],
          pendencias: [
            '1. Objeto e Exigências Técnicas: Confirmar acervo técnico CAT/CREA para 500m³/dia de efluentes industriais.',
            '2. Cotação de Fornecedor: Confirmar validade da proposta de kits analíticos do laboratório SGS (validade expira em 5 dias).',
            '3. Garantia de Proposta: Confirmar se edital exige seguro-garantia de 1% já na abertura.'
          ],
          recomendacao: 'Confirmar os campos na tela de Oportunidades ou clicar no selo de saúde para emitir confirmação auditada.',
          fontes: 'QualityGate Engine e DataQualityRule (FASE 48).'
        };
      } else if (lower.includes('marcada como stale') || lower.includes('por que está stale') || lower.includes('análise stale') || lower.includes('stale warning') || lower.includes('dado stale')) {
        structuredReply = {
          resumo: 'Explicação de Análise Stale (Propagação de Invalidação de Dados): A simulação estratégica anterior foi marcada como STALE porque o preço base dos insumos foi reajustado pelo fornecedor após a emissão da cotação original. Conforme o Princípio da Reproduzibilidade da FASE 48, análises derivadas nunca utilizam silenciosamente dados que foram suplantados.',
          indicadores: [
            { label: 'Status da Análise', value: 'STALE (Desatualizada)' },
            { label: 'Gatilho de Invalidação', value: 'Alteração em SupplierQuote.unitPrice' },
            { label: 'Impacto Derivado', value: 'Margem Líquida & Cenário Agressivo' },
            { label: 'Ação Recomendada', value: 'Reprocessar Simulação' }
          ],
          pendencias: [
            'Rastreabilidade de Versão: A análise usava o Snapshot v1.2 (Preço R$ 420/unid). A cotação atualizada registrou R$ 465/unid em 16/10.',
            'Transparência Ética: O Vellia não oculta a defasagem para preservar gráficos bonitos. O aviso permanecerá até o recálculo.'
          ],
          recomendacao: 'Acessar o módulo de Simulação Estratégica e clicar em "Reprocessar com Dados Vigentes".',
          fontes: 'Stale Propagation Engine e Derived Data Lineage (FASE 48).'
        };
      }

      // FASE 46: PERGUNTAS SOBRE RISCO CONTRATUAL, MULTAS, SLAs E OBRIGAÇÕES PÓS-VITÓRIA (Itens 124 a 127)
      else if (lower.includes('principais riscos') || lower.includes('riscos deste contrato') || lower.includes('risco contratual')) {
        const review = contractRiskService.getReviewByContractId('CTR-2026-PETRO-091');
        structuredReply = {
          resumo: `Análise Operacional de Riscos do Contrato ${review?.contractNumber || '4600612980/2026'} (Petrobras RNEST): Identificados 2 riscos de nível moderado/alto e 1 mitigação essencial em andamento. Não foram constatadas ilegalidades manifestas, recomendando-se revisão jurídica prévia sobre a cláusula de penalidades.`,
          indicadores: [
            { label: 'Exposição Potencial', value: 'R$ 112.700,00' },
            { label: 'Teto Teórico Multa', value: '5,0% Global' },
            { label: 'Mobilização', value: '15 dias corridos' },
            { label: 'Subcontratação', value: 'Limitada a 25%' }
          ],
          pendencias: [
            'Cláusula 18.2 (Pág. 12): Multa moratória diária de 0,5% por atraso na mobilização de campo. Pelo impacto financeiro potencial, recomendo revisão jurídica antes da assinatura.',
            'Anexo I / SLA Item 4.3 (Pág. 9): Prontidão presencial em até 4h para emergências na ETE. Base em Ipojuca atende em 45min.'
          ],
          recomendacao: 'Alinhar com a equipe de operações a entrega antecipada dos kits de análise e manter apólice de garantia protocolada.',
          fontes: 'Contrato_Assinado_4600612980.pdf (Págs. 9, 12, 16) — Módulo Contract Risk Review (FASE 46).'
        };
      } else if (lower.includes('existe multa') || (lower.includes('multa') && lower.includes('contrato'))) {
        structuredReply = {
          resumo: 'Extração Estruturada de Cláusula de Multa: Sim, a Cláusula 18.2 do Contrato prevê multa moratória diária de 0,5% sobre o valor global (R$ 2.254.000,00) em caso de atraso injustificado no início dos serviços, com teto de 5% (R$ 112.700,00).',
          indicadores: [
            { label: 'Documento', value: 'Contrato Oficial' },
            { label: 'Página / Seção', value: 'Pág. 12 — Cl. 18.2' },
            { label: 'Alíquota', value: '0,5% ao dia' },
            { label: 'Exposição Máxima', value: 'R$ 112.700,00' }
          ],
          pendencias: [
            'Trecho Oficial: "O atraso injustificado no início dos serviços ensejará multa moratória de 0,5% ao dia sobre o valor global, até o limite de 5%."',
            'Nota de Governança: Trata-se de exposição contratual potencial calculada pelas regras do certame (não de perda provável). Recomenda-se revisão jurídica antes da assinatura.'
          ],
          recomendacao: 'A equipe de operações deve confirmar o check-in presencial no 14º dia para evitar incidência de mora.',
          fontes: 'Contrato_Assinado_4600612980.pdf — Cláusula 18.2.'
        };
      } else if (lower.includes('obrigações vencem') || lower.includes('obrigações este mês') || lower.includes('quais obrigações')) {
        const review = contractRiskService.getReviewByContractId('CTR-2026-PETRO-091');
        const pending = review?.obligations?.filter(o => o.status !== 'Compliant') || [];
        structuredReply = {
          resumo: `Obrigações Estratégicas Rastreadas: Existem ${pending.length} obrigações acompanháveis ativas para este ciclo contratual, sendo 2 com prazo prioritário neste mês.`,
          indicadores: [
            { label: 'Total Rastreado', value: `${review?.obligations?.length || 6}` },
            { label: 'Pendentes / Em Curso', value: `${pending.length}` },
            { label: 'Criticidade Alta/Crítica', value: '3' },
            { label: 'Próximo Vencimento', value: '15/11/2026' }
          ],
          pendencias: [
            'Mobilização Integral (TR Item 4, Pág. 12): Início dos turnos de 24h na ETE até 15/11/2026 (Marcelo Antunes).',
            'Relatório Mensal de Laudos Acreditados (Cláusula 8.1, Pág. 20): Entrega de ensaios laboratoriais Inmetro até o 5º dia útil (Dr. Roberto Albuquerque).'
          ],
          recomendacao: 'Exigir anexo de comprovação no Document Vault para cada entrega antes de marcar como "Compliant".',
          fontes: 'Matriz de Cumprimento de Obrigações Contratuais — FASE 46.'
        };
      } else if (lower.includes('permite subcontratação') || lower.includes('subcontrata')) {
        structuredReply = {
          resumo: 'Regra de Subcontratação Contratual: A Cláusula 11 (Pág. 14 do Contrato) veda a subcontratação total do objeto, mas admite expressamente a subcontratação parcial restrita a ensaios laboratoriais especializados (ISO 17025) e transporte de resíduos, com limite máximo de 25% do valor global.',
          indicadores: [
            { label: 'Regra', value: 'Subcontratação Limitada' },
            { label: 'Teto Permitido', value: 'Até 25% do Contrato' },
            { label: 'Escopo Aprovado', value: 'Ensaios e Resíduos' },
            { label: 'Compatibilidade Proposta', value: '100% Conforme' }
          ],
          pendencias: [
            'Trecho: "A subcontratação parcial é admitida estritamente para ensaios analíticos e transporte de resíduos Classe I, limitada a 25% do valor global, mediante anuência prévia."',
            'Cruzamento com Fase 45: O parceiro técnico orçado na proposta comercial (Laboratório SGS) está plenamente alinhado às condições da cláusula.'
          ],
          recomendacao: 'Submeter formalmente o termo de credenciamento do laboratório ao fiscal antes do início das coletas.',
          fontes: 'Contrato_Assinado_4600612980.pdf — Cláusula 11 (Pág. 14).'
        };
      } else if (lower.includes('sla é mais crítico') || lower.includes('qual sla') || lower.includes('sla mais critico')) {
        structuredReply = {
          resumo: 'Requisito de SLA Mais Crítico: O Anexo I / Caderno Técnico (Item 4.3, Pág. 9) estipula tempo de resposta presencial emergencial de no máximo 4 horas a partir do acionamento formal pelo Fiscal Petrobras em eventos anômalos na ETE.',
          indicadores: [
            { label: 'Métrica', value: 'Prontidão Emergencial' },
            { label: 'Meta (SLA)', value: '≤ 4 horas in loco' },
            { label: 'Penalidade de SLA', value: '1% da medição mensal' },
            { label: 'Capacidade Operacional', value: 'Base em Ipojuca (45 min)' }
          ],
          pendencias: [
            'Fonte: Anexo I — Caderno Técnico / SLA Item 4.3 (Pág. 9).',
            'Operational Fit (Fase 44): Nossa base avançada em Ipojuca/PE garante tempo de tráfego de 45 a 60 minutos, apresentando margem de segurança segura de 3 horas.'
          ],
          recomendacao: 'Manter veículo com tanque cheio e kit de barreiras de contenção preparado na base de Ipojuca.',
          fontes: 'Caderno Técnico Item 4.3 e Módulo de Prontidão Operacional (FASE 44).'
        };
      } else if (lower.includes('mudou entre a minuta') || lower.includes('contrato final') || lower.includes('contract diff')) {
        const review = contractRiskService.getReviewByContractId('CTR-2026-PETRO-091');
        structuredReply = {
          resumo: 'Contract Diff (Comparação Edital vs Minuta vs Contrato Final): Não foram identificadas alterações prejudiciais. Foram detectadas duas divergências redacionais menores: prazo de aprovação de medição pelo fiscal reduzido de 10 para 8 dias úteis (favorável à empresa) e envio de relatórios padronizado por certificado digital ICP-Brasil.',
          indicadores: [
            { label: 'Divergências Críticas', value: '0 detectadas' },
            { label: 'Prazo Medição', value: 'Reduzido de 10 p/ 8 dias' },
            { label: 'Formato Relatório', value: 'Digital ICP-Brasil' },
            { label: 'Impacto Financeiro', value: 'Positivo (fluxo caixa)' }
          ],
          pendencias: [
            'Diferença 1: Minuta previa 10 dias úteis para atesto; Contrato Final reduziu para 8 dias úteis.',
            'Diferença 2: Relatório em papel substituído por upload digital no Portal Petronect.'
          ],
          recomendacao: 'Nenhuma impugnação é necessária. As alterações beneficiam o fluxo financeiro da Veeluen.',
          fontes: 'Motor de Contract Diff da FASE 46.'
        };
      }

      // FASE 38: PERGUNTAS SOBRE A CENTRAL DO AGENTE E OPERAÇÃO SUPERVISIONADA (Itens 145, 146 e 147)
      if (lower.includes('agente fez hoje') || lower.includes('o que o agente fez') || lower.includes('executou hoje')) {
        const report = agentControlCenterService.getDailySummaryReport();
        structuredReply = {
          resumo: `Relatório da Operação do Agente Hoje: Foram realizadas ${report.metrics.executionsToday} execuções pelos agentes lógicos. ${report.metrics.opportunitiesAnalyzed} oportunidades analisadas (${report.metrics.relevantOpportunities} relevantes), ${report.metrics.humanInterventionsNeeded} intervenções na fila humana e ${report.metrics.failedWorkflows} falhas monitoradas.`,
          indicadores: [
            { label: 'Status Geral', value: report.status },
            { label: 'Execuções Hoje', value: `${report.metrics.executionsToday}` },
            { label: 'Oportunidades Analisadas', value: `${report.metrics.opportunitiesAnalyzed}` },
            { label: 'Aguardando Você', value: `${report.metrics.humanInterventionsNeeded}` }
          ],
          pendencias: [
            'Intervenção Humana: Há itens aguardando decisão na fila "Precisa de Você" da Central do Agente.',
            'Graceful Degradation: Conectores operando com fallback automático quando aplicável.'
          ],
          recomendacao: 'Abrir a Central do Agente para inspecionar a Live Activity e o detalhamento das execuções.',
          fontes: 'AgentControlCenterService e AgentRegistry (FASE 38).'
        };
      } else if (lower.includes('aguardando minha intervenção') || lower.includes('precisa de você') || lower.includes('minha intervenção')) {
        const queue = agentControlCenterService.getPendingHumanInterventions();
        structuredReply = {
          resumo: `Fila Precisa de Você: Existem ${queue.length} pendências que exigem intervenção humana deliberada. O Vellia respeita os limites rígidos de autonomia e não executa decisões ambíguas ou críticas sem seu aval.`,
          indicadores: [
            { label: 'Pendências Humanas', value: `${queue.length}` },
            { label: 'Urgência Crítica', value: `${queue.filter(q => q.priority === 'CRITICAL').length}` },
            { label: 'Alta Prioridade', value: `${queue.filter(q => q.priority === 'HIGH').length}` },
            { label: 'Agentes Envolvidos', value: 'RADAR, DOC, PRICING' }
          ],
          pendencias: queue.slice(0, 2).map(q => `${q.title} — ${q.description}`),
          recomendacao: 'Acessar a aba "Precisa de Você" na Central do Agente para validar ou rejeitar as propostas.',
          fontes: 'Fila de Intervenções Humanas Supervisionadas (FASE 38).'
        };
      } else if (lower.includes('integração está com problema') || lower.includes('conector') || lower.includes('fontes com problema')) {
        const statuses = agentControlCenterService.getIntegrationStatuses();
        const degraded = statuses.filter(s => s.status !== 'HEALTHY');
        structuredReply = {
          resumo: `Diagnóstico de Integrações e Degradação Suave: De ${statuses.length} conectores monitorados, ${degraded.length} apresentam degradação ou atenção. O sistema mantém isolamento de falha.`,
          indicadores: [
            { label: 'PNCP', value: statuses.find(s => s.id === 'PNCP')?.status || 'HEALTHY' },
            { label: 'Petronect', value: statuses.find(s => s.id === 'PETRONECT')?.status || 'HEALTHY' },
            { label: 'Compras.gov', value: statuses.find(s => s.id === 'COMPRAS_GOV')?.status || 'HEALTHY' },
            { label: 'AI Core', value: statuses.find(s => s.id === 'AI_CORE')?.status || 'HEALTHY' }
          ],
          pendencias: degraded.map(d => `${d.name}: ${d.impact} (Modo: ${d.degradedBehavior})`),
          recomendacao: 'Nenhuma ação destrutiva é necessária. O motor segue operando em modo degradado seguro.',
          fontes: 'Monitor de Conectores e Graceful Degradation Engine (FASE 38).'
        };
      } else if (lower.includes('agente está falhando') || lower.includes('qual agente falhou') || lower.includes('falhas de agente')) {
        const execs = agentControlCenterService.getExecutions().filter(e => e.status === 'FAILED');
        structuredReply = {
          resumo: `Monitor de Falhas de Agentes: Há ${execs.length} registro(s) de falha hoje. O Vellia registra telemetria completa com trace de IA e fallback léxico acionado.`,
          indicadores: [
            { label: 'Falhas Registradas', value: `${execs.length}` },
            { label: 'Resiliência', value: 'Fallback Léxico Ativo' },
            { label: 'Segurança', value: 'Sem vazamento de estado' },
            { label: 'Hard Limits', value: '100% Protegidos' }
          ],
          pendencias: execs.length > 0 ? [execs[0]?.summary || 'Falha transitória com retry seguro disponível'] : ['Nenhuma falha crítica no momento'],
          recomendacao: 'Consultar o botão "Por que isso aconteceu?" no histórico da Central do Agente.',
          fontes: 'AgentControlCenterService (FASE 38).'
        };
      } else if (lower.includes('por que essa oportunidade foi priorizada') || lower.includes('oportunidade foi priorizada')) {
        structuredReply = {
          resumo: `Explicação de Priorização pelo Radar Agent: Esta oportunidade recebeu alta prioridade devido a aderência semântica de 94%, prazo exíguo de 3 dias, histórico positivo de contratações no órgão e valor estratégico estimado de R$ 2,4M.`,
          indicadores: [
            { label: 'Agente Responsável', value: 'RADAR_AGENT v2.4' },
            { label: 'Aderência Técnica', value: '94%' },
            { label: 'Urgência Prazo', value: '3 dias restantes' },
            { label: 'Confidence IA', value: 'Alta (0.91)' }
          ],
          pendencias: [
            'Regra Utilizada: Critério de Scoring Ponderado (Serviços Primários + Capacidade de Equipe + Margem Projetada).',
            'Alçada: O agente sugeriu Prioridade Alta, mas a decisão final de Go/No-Go permanece humana.'
          ],
          recomendacao: 'Abrir a aba "Histórico & Explicações" na Central do Agente para ver o trace completo de IA.',
          fontes: 'Decision Trace do Radar Agent e Matriz de Scoring do Vellia.'
        };
      } else if (lower.includes('mudar autonomia') || lower.includes('alterar autonomia') || lower.includes('aumentar autonomia') || lower.includes('tornar autônomo')) {
        structuredReply = {
          resumo: `Bloqueio de Governança de Autonomia: O Copilot não possui permissão para alterar níveis de autonomia (L0-L4) nem relaxar políticas de agentes. Por determinação da FASE 38 (Item 147), alterações de autonomia exigem autenticação administrativa formal com perfil ADMIN na Central do Agente.`,
          indicadores: [
            { label: 'Permissão Copilot', value: 'Negado (Read-Only)' },
            { label: 'Alçada Requerida', value: 'Administrador / Diretoria' },
            { label: 'Hard Safety Limits', value: 'Invioláveis' },
            { label: 'Canal Oficial', value: 'Central do Agente' }
          ],
          pendencias: [
            'Ações como Auto-bid (dar lance) e envio de proposta final são permanentemente restritas a controle humano.',
            'Mudanças de política exigem registro auditado de justificativa na interface administrativa.'
          ],
          recomendacao: 'Acessar Central do Agente > Registro de Agentes & Políticas com credenciais de Administrador.',
          fontes: 'Política de Hard Limits e Alçadas de Segurança (FASE 38).'
        };
      } 
      // FASE 41: CENTRO DE RELATÓRIOS + BRIEFINGS EXECUTIVOS + GERAÇÃO DE DOCUMENTOS (Item 114)
      else if (lower.includes('resumo executivo') || lower.includes('gere o resumo executivo')) {
        const rep = reportGenerationService.getReportById('REP-2026-001');
        structuredReply = {
          resumo: `Resumo Executivo Estruturado Gerado: Documento corporativo compilado com fidelidade histórica a partir do edital Petronect nº 7004128956 e Dossiê de Habilitação. Valor estimado de R$ 2.450.000,00, aderência técnica de 94% e atestado Braskem homologado.`,
          indicadores: [
            { label: 'Documento', value: 'REP-2026-001 (v1.0)' },
            { label: 'Status', value: rep.status },
            { label: 'Classificação', value: rep.securityClassification },
            { label: 'Snapshot ID', value: rep.snapshotId }
          ],
          pendencias: [
            'Rastreabilidade Imutável: Os dados foram congelados no Snapshot SNAP-2026-001.',
            'Acesso ao Arquivo: Visualização em página A4 timbrada e exportação PDF/DOCX disponíveis no Centro de Relatórios.'
          ],
          recomendacao: 'Acessar a aba "Relatórios & Briefings" no menu lateral para visualizar ou imprimir a versão aprovada.',
          fontes: 'ReportGenerationService (FASE 41) e Snapshot SNAP-2026-001.'
        };
      } else if (lower.includes('relatório de go/no-go') || lower.includes('relatório go/no-go') || lower.includes('prepare relatório de go/no-go')) {
        const rep = reportGenerationService.getReportById('REP-2026-002');
        structuredReply = {
          resumo: `Relatório Formal Go/No-Go Deliberado: Instrumento oficial aprovado pelo comitê executivo com registro formal de deliberação (GO ESTRATÉGICO), justificativa comercial, preço piso protegido em R$ 2.009.000,00 e assinaturas da diretoria.`,
          indicadores: [
            { label: 'Decisão', value: 'GO ESTRATÉGICO' },
            { label: 'Margem Piso', value: '12.0%' },
            { label: 'Aprovadores', value: 'Dr. Henrique + Roberto' },
            { label: 'Classificação', value: 'Confidencial' }
          ],
          pendencias: [
            'Governança Vinculada: Em conformidade com a política de alçadas da Fase 36.',
            'Sem Alteração Histórica: O documento está blindado contra alterações retroativas.'
          ],
          recomendacao: 'Abrir o Centro de Relatórios para consultar a via timbrada com assinaturas digitais.',
          fontes: 'ReportGenerationService e Comitê de Licitações (FASE 41).'
        };
      } else if (lower.includes('briefing para reunião') || lower.includes('briefing de reunião')) {
        structuredReply = {
          resumo: `Briefing Executivo de Reunião com Cliente: Síntese contextual estruturada a partir do CRM, Contratos ativos e Radar. Organização: Petrobras RNEST. Interlocutor: Eng. Marcelo Cavalcanti (Gerente de Manutenção). Pauta principal: Renegociação de aditivo de prazo do contrato de inspeção NR-13 e alinhamento para o certame PE 048/2026.`,
          indicadores: [
            { label: 'Tipo', value: 'Briefing de Reunião' },
            { label: 'Cliente', value: 'Petrobras RNEST' },
            { label: 'Interlocutor', value: 'Eng. Marcelo Cavalcanti' },
            { label: 'Contrato Vigente', value: 'CT-4600058912/2025' }
          ],
          pendencias: [
            'Ponto de Atenção: Concorrente HidroEco com contrato expirando em 38 dias.',
            'Objetivo: Demonstrar capacidade imediata de mobilização de sondas isocinéticas.'
          ],
          recomendacao: 'Consultar o one-pager no Centro de Relatórios ou imprimir via PDF.',
          fontes: 'CRM Corporativo, Contratos e ReportGenerationService (FASE 41).'
        };
      } else if (lower.includes('relatório mensal de mercado') || lower.includes('relatório de mercado')) {
        structuredReply = {
          resumo: `Relatório Executivo de Mercado (Outubro/2026): Análise consolidada baseada em 386 oportunidades e contratações mapeadas no Nordeste. Petrobras e COMPESA lideram as demandas em O&M e monitoramento ambiental, com concentração de 42% no 4º trimestre.`,
          indicadores: [
            { label: 'Cobertura', value: '386 Processos Monitorados' },
            { label: 'Setor Líder', value: 'Óleo & Gás (R$ 84.5M)' },
            { label: 'Taxa Média Deságio', value: '14.2% a 17.5%' },
            { label: 'Sinais em Radar', value: '14 Oportunidades Futuras' }
          ],
          pendencias: [
            'Limitação Metodológica: Base restrita a editais publicados no PNCP, Compras.gov.br e Petronect.',
            'Exportação Disponível: Modelo consolidado pronto para apresentação de Diretoria.'
          ],
          recomendacao: 'Abrir a aba "Relatórios & Briefings > Mercado" para baixar o caderno executivo.',
          fontes: 'MarketIntelligenceService (FASE 32) e ReportGenerationService (FASE 41).'
        };
      }
      // FASE 44: INTELIGÊNCIA DE CAPACIDADE OPERACIONAL + PRONTIDÃO PARA EXECUÇÃO + RESOURCE FIT (Itens 149 a 153)
      else if (lower.includes('conseguimos executar') || lower.includes('se ganharmos') || lower.includes('prontidão operacional') || lower.includes('fit operacional')) {
        const oppTarget = activeOpportunity || { id: 'opp-sabesp-ete', title: 'Operação e Monitoramento ETE Sabesp', serviceId: 'srv-ete-operacao', companyId: 'emp-veeluen', startDate: '2026-11-01', endDate: '2027-10-31' };
        const assess = executionReadinessService.evaluateOpportunityReadiness(oppTarget, { companyId: 'emp-veeluen', trigger: 'Copilot Query' });
        
        structuredReply = {
          resumo: `Diagnóstico de Prontidão Operacional: A oportunidade possui ${assess.status.replace(/_/g, ' ')} (Score: ${assess.overallScore}%). A equipe necessária está mapeada, mas há pendências operacionais ativas que devem ser sanadas antes da assinatura contratual.`,
          indicadores: [
            { label: 'Status Geral', value: assess.status.replace(/_/g, ' ') },
            { label: 'Fit Global', value: `${assess.overallScore}%` },
            { label: 'Equipe Alocada', value: `${assess.teamReadiness.assignedMembers.length} profissionais` },
            { label: 'Gaps Ativos', value: `${assess.gaps.length} apontamentos` }
          ],
          pendencias: [
            `Capacidade Atual: ${assess.teamReadiness.details}; ${assess.equipmentReadiness.details}.`,
            `Gaps Identificados: ${assess.gaps.length > 0 ? assess.gaps.map(g => `[${g.severity}] ${g.title}`).join('; ') : 'Nenhum blocker ativo.'}`,
            `Premissas: Contrato assinado prevalece sobre reserva preliminar. Mobilização prevista em 30 dias.`,
            `Cenário: Viável com execução do plano de mitigação para calibração de ativos e reciclagem de NRs.`
          ],
          recomendacao: 'Acessar a aba "Prontidão Operacional" no menu lateral para visualizar os 5 blocos operacionais e o plano de ação.',
          fontes: 'ExecutionReadinessService (FASE 44) e Cadastro Operacional Integrado.'
        };
      } else if (lower.includes('qual profissional está disponível') || lower.includes('profissional disponível') || lower.includes('profissionais disponíveis')) {
        const members = executionReadinessService.listAvailableTeamMembers('emp-veeluen');
        const freeMembers = members.filter(m => m.allocationStatus === 'LIVRE');
        const partialMembers = members.filter(m => m.allocationStatus === 'PARCIAL');

        structuredReply = {
          resumo: `Disponibilidade Operacional de Equipe: Identificados ${freeMembers.length} profissionais 100% livres e ${partialMembers.length} profissionais com alocação parcial na Veeluen Solutions.`,
          indicadores: [
            { label: 'Equipe Total', value: `${members.length} cadastrados` },
            { label: '100% Livres', value: `${freeMembers.length} profissionais` },
            { label: 'Alocação Parcial', value: `${partialMembers.length} profissionais` },
            { label: 'Comprometidos', value: `${members.filter(m => m.allocationStatus === 'COMPROMETIDO').length}` }
          ],
          pendencias: [
            `Capacidade Atual: Livres: ${freeMembers.map(m => `${m.name} (${m.role})`).join(', ') || 'Nenhum'}.`,
            `Gaps: Especialistas de NR-33/NR-35 com contratos em execução exigem remanejamento de turnos.`,
            `Premissas: Alocações baseadas em contratos ativos vigentes (Fase 31). Sem horas extras não autorizadas.`,
            `Cenário: Cobertura imediata suficiente para mobilização de 1 contrato simultâneo.`
          ],
          recomendacao: 'Consultar "Prontidão Operacional > Matriz Operacional" para visualizar competências e tags técnicas.',
          fontes: 'Cadastro Operacional de Profissionais e Gestão de Contratos (FASE 44 & 31).'
        };
      } else if (lower.includes('existe conflito de equipe') || lower.includes('conflito de equipe') || lower.includes('conflito de alocação')) {
        const oppTarget = activeOpportunity || { id: 'opp-sabesp-ete', title: 'Operação e Monitoramento ETE Sabesp', serviceId: 'srv-ete-operacao', companyId: 'emp-veeluen', startDate: '2026-11-01', endDate: '2027-10-31' };
        const assess = executionReadinessService.evaluateOpportunityReadiness(oppTarget, { companyId: 'emp-veeluen' });

        structuredReply = {
          resumo: `Análise de Sobreposição & Conflito de Agenda: ${assess.scheduleReadiness.conflicts.length > 0 ? `Detectado(s) ${assess.scheduleReadiness.conflicts.length} conflito(s) potencial(is) de alocação de equipe entre contratos vigentes e a nova oportunidade.` : 'Nenhum conflito de equipe impeditivo detectado para o período previsto de execução.'}`,
          indicadores: [
            { label: 'Conflitos Detectados', value: `${assess.scheduleReadiness.conflicts.length}` },
            { label: 'Status Agenda', value: assess.scheduleReadiness.status },
            { label: 'Profissionais em Risco', value: assess.scheduleReadiness.conflicts.length > 0 ? '1 operador sênior' : '0' },
            { label: 'Criticidade', value: assess.scheduleReadiness.conflicts.length > 0 ? 'Moderada' : 'Baixa' }
          ],
          pendencias: [
            `Capacidade Atual: ${assess.scheduleReadiness.details}.`,
            `Gaps: ${assess.scheduleReadiness.conflicts.length > 0 ? assess.scheduleReadiness.conflicts.map(c => c.message).join('; ') : 'Equipe escalada disponível.'}`,
            `Premissas: O contrato assinado em vigência prevalece sobre reservas preliminares de oportunidade.`,
            `Cenário: Remanejar técnico backup cadastrado ou autorizar contratação complementar em caso de vitória.`
          ],
          recomendacao: 'Acessar "Prontidão Operacional > Agenda" para auditar as sobreposições de contratos.',
          fontes: 'ScheduleConflictEngine (FASE 44) e Contratos Conquistados (FASE 31).'
        };
      } else if (lower.includes('qual equipamento falta') || lower.includes('equipamento falta') || lower.includes('equipamentos disponíveis')) {
        const oppTarget = activeOpportunity || { id: 'opp-braskem-emissao', title: 'Amostragem Isocinética de Emissões Atmosféricas', serviceId: 'srv-emissao-atmosferica', companyId: 'emp-veeluen', startDate: '2026-11-15', endDate: '2027-05-15' };
        const assess = executionReadinessService.evaluateOpportunityReadiness(oppTarget, { companyId: 'emp-veeluen' });
        const eqGaps = assess.gaps.filter(g => g.category === 'EQUIPMENT');

        structuredReply = {
          resumo: `Diagnóstico de Equipamentos & Calibração RBC: O parque instrumental atende fisicamente aos quantitativos, porém há ${eqGaps.length} apontamento(s) metrológico(s) de calibração ou manutenção preventiva.`,
          indicadores: [
            { label: 'Equipamentos Atribuídos', value: `${assess.equipmentReadiness.assignedEquipments.length}` },
            { label: 'Gaps de Ativos', value: `${eqGaps.length}` },
            { label: 'Status Metrológico', value: assess.equipmentReadiness.status },
            { label: 'Calibrações RBC', value: '1 Vencendo' }
          ],
          pendencias: [
            `Capacidade Atual: Instrumentos EPA 5 e Analisadores multigás alocados na sede operacional.`,
            `Gaps: ${eqGaps.map(g => `${g.title} (${g.mitigationPlan})`).join('; ') || 'Nenhum equipamento em falta.'}`,
            `Premissas: Laudos de calibração RBC devem estar válidos no dia 1 da mobilização em campo.`,
            `Cenário: Enviar sonda isocinética para calibração com prazo de retorno em 15 dias corridos.`
          ],
          recomendacao: 'Consultar "Prontidão Operacional > Equipamentos" para acompanhar as datas de calibração.',
          fontes: 'Cadastro Operacional de Instrumentos e Calibrações RBC (FASE 44).'
        };
      } else if (lower.includes('certificações vencem') || lower.includes('vencem durante o contrato') || lower.includes('certificados vencem')) {
        const oppTarget = activeOpportunity || { id: 'opp-sabesp-ete', title: 'Operação e Monitoramento ETE Sabesp', serviceId: 'srv-ete-operacao', companyId: 'emp-veeluen', startDate: '2026-11-01', endDate: '2027-10-31' };
        const assess = executionReadinessService.evaluateOpportunityReadiness(oppTarget, { companyId: 'emp-veeluen' });
        const expDuring = assess.certificationReadiness.expiringDuringContract;

        structuredReply = {
          resumo: `Auditoria de Validade de Certificações Durante o Contrato: Foram identificadas ${expDuring.length} certificação(ões) técnica(s) e treinamentos que expiram DURANTE a execução do contrato (período de 12 meses).`,
          indicadores: [
            { label: 'Certificações Válidas Hoje', value: `${assess.certificationReadiness.validCertifications.length}` },
            { label: 'Vencem na Execução', value: `${expDuring.length} itens` },
            { label: 'Risco de Interrupção', value: 'Controlado (Reciclagem)' },
            { label: 'Status Certificações', value: assess.certificationReadiness.status }
          ],
          pendencias: [
            `Capacidade Atual: Profissionais habilitados e aptos na data de julgamento do certame.`,
            `Gaps: ${expDuring.map(c => `${c.certName} do profissional ${c.memberName} (Vence em ${c.expiresAt})`).join('; ')}.`,
            `Premissas: Não marcar como 'Plenamente Pronto' se a validade não cobrir todo o período contratual sem reciclagem planejada.`,
            `Cenário: Agendar reciclagem mandatória de NR-33/NR-35 no 60º dia que antecede o vencimento.`
          ],
          recomendacao: 'Acessar "Prontidão Operacional > Gaps Operacionais" para acompanhar os prazos de reciclagem.',
          fontes: 'Motor de Validade Contratual de Certificações (FASE 44).'
        };
      } else if (lower.includes('três maiores') || lower.includes('três oportunidades') || lower.includes('múltiplas vitórias') || lower.includes('ganharmos as três')) {
        const simRes = executionReadinessService.simulateWhatIfCapacity(['opp-sabesp-ete', 'opp-braskem-emissao', 'opp-petrobras-nr13'], {
          targetPeriod: { start: '2026-11-01', end: '2027-05-01' }
        });

        structuredReply = {
          resumo: `Simulação What-If de Múltiplas Vitórias: Simulação de conquista simultânea das 3 maiores oportunidades (R$ ${(simRes.totalSimulatedValue / 1000000).toFixed(2)}M em disputa). Risco de Conflito Global: ${simRes.globalConflictRisk}. A equipe técnica ficaria altamente comprometida no 1º trimestre de 2027.`,
          indicadores: [
            { label: 'Oportunidades Simuladas', value: `${simRes.simulatedOpportunitiesCount} certames` },
            { label: 'Valor em Disputa', value: `R$ ${(simRes.totalSimulatedValue / 1000000).toFixed(2)}M` },
            { label: 'Conflitos de Equipe', value: `${simRes.teamConflicts.length}` },
            { label: 'Risco Global', value: simRes.globalConflictRisk }
          ],
          pendencias: [
            `Capacidade Atual: Parque de equipamentos absorve a demanda com agendamento metrológico.`,
            `Gaps: ${simRes.teamConflicts.map(c => c.message).join('; ') || 'Sem gaps críticos de ativos.'}`,
            `Premissas: Ambiente sandbox de simulação — a capacidade real e alocações de produção NÃO são alteradas.`,
            `Cenário: Exigirá contratação temporária de 2 técnicos operacionais ou subcontratação de laboratório acreditado.`
          ],
          recomendacao: 'Abrir "Prontidão Operacional > Simulação What-If" para selecionar outros cenários de oportunidades.',
          fontes: 'What-If Capacity Sandbox (FASE 44).'
        };
      }
      // FASE 45: ECOSSISTEMA DE PARCEIROS + FORNECEDORES + COTAÇÕES ESTRATÉGICAS (Itens 164 a 168)
      else if (lower.includes('fornecedores podem atender') || lower.includes('quais fornecedores') || lower.includes('parceiros podem atender')) {
        const supps = supplierQuotationService.listSuppliers({ companyId: 'veeluen' });
        const labSupps = supps.filter(s => s.categories.includes(SupplierCategory.LABORATORIO_AMBIENTAL));
        const locSupps = supps.filter(s => s.categories.includes(SupplierCategory.LOCACAO_EQUIPAMENTOS));

        structuredReply = {
          resumo: `Mapeamento de Terceiros e Fornecedores Homologados: Identificados ${supps.length} parceiros qualificados na base canônica do Vellia. Para o escopo de ensaios ambientais e laboratório: ${labSupps.map(s => s.organizationName).join(', ')}. Para locação de instrumentos: ${locSupps.map(s => s.organizationName).join(', ')}.`,
          indicadores: [
            { label: 'Fornecedores Ativos', value: `${supps.length}` },
            { label: 'Laboratórios Acreditados', value: `${labSupps.length}` },
            { label: 'Locadoras Homologadas', value: `${locSupps.length}` },
            { label: 'Isolamento Empresa', value: 'Veeluen Solutions' }
          ],
          pendencias: [
            `Status Confirmado: ${labSupps[0]?.organizationName || 'BioAnálise'} possui Acreditação Inmetro ISO 17025 CRL 0491 válida até 2028.`,
            `Status Cotado: Cotações vigentes em análise técnica no comparador.`,
            `Status Estimado: Custo logístico de mobilização estimado por parâmetro de diárias.`,
            `Risco de Dependência: Apenas 1 fornecedor regional homologado para trem isocinético calibrado (Locatron).`
          ],
          recomendacao: 'Acessar a aba "Parceiros & Cotações > Catálogo de Fornecedores" para consultar tabelas de referência.',
          fontes: 'SupplierQuotationService e Entidades Canônicas Organization do CRM (FASE 45).'
        };
      } else if (lower.includes('cotação de laboratório') || lower.includes('cotação válida') || lower.includes('laboratório válida')) {
        const quotes = supplierQuotationService.listQuotations({ category: SupplierCategory.LABORATORIO_AMBIENTAL });
        const validQuotes = quotes.filter(q => new Date(q.validUntil) >= new Date());

        structuredReply = {
          resumo: `Diagnóstico de Cotações Laboratoriais: Existem 2 cotações registradas para análise de efluentes da ETE. A menor cotação nominal é de R$ 39.000,00 (Cetrel), porém NÃO inclui coleta de campo nem transporte refrigerado. A segunda cotação é de R$ 48.500,00 (BioAnálise), que inclui coleta in loco semanal, frascos e transporte acreditado.`,
          indicadores: [
            { label: 'Cotações Válidas', value: `${validQuotes.length}` },
            { label: 'Cotação Homologada', value: 'R$ 48.500 (BioAnálise)' },
            { label: 'Cotação Restrita', value: 'R$ 39.000 (Sem frete)' },
            { label: 'Alerta de Escopo', value: 'Escopos Não Equivalentes' }
          ],
          pendencias: [
            'Classificação: Confirmado para BioAnálise (escopo integral homologado na proposta).',
            'Alerta de Divergência: Cotação da Cetrel exige contratar equipe de amostragem à parte (+R$ 14.000 estimados).',
            'Validade: Cotação COT-BIO-8912/26 válida até 15/12/2026.',
            'Ação Sugerida: Manter a cotação da BioAnálise vinculada à composição de custos do edital Sabesp.'
          ],
          recomendacao: 'Abrir "Parceiros & Cotações > Comparador de Cotações" para visualizar os memoriais de cálculo.',
          fontes: 'Comparador de Cotações e Auditoria de Escopos do Vellia (FASE 45).'
        };
      } else if (lower.includes('usamos da última vez') || lower.includes('última vez') || lower.includes('histórico de fornecedor')) {
        const bio = supplierQuotationService.getSupplierById('SUPP-BIOANALISE');

        structuredReply = {
          resumo: `Histórico de Utilização de Terceiros: Na última licitação com escopo de ensaios efluentes e emissões (Petrobras RNEST 2025/2026), utilizamos o "Laboratório BioAnálise Ambiental Ltda." (Avaliação Interna: Preferencial).`,
          indicadores: [
            { label: 'Último Utilizado', value: 'BioAnálise Ambiental' },
            { label: 'Avaliação Interna', value: 'Preferencial (Nota Máxima)' },
            { label: 'Desconto Aplicado', value: '15% Tabela Corporativa' },
            { label: 'Ocorrências', value: '0 incidentes / Pontual' }
          ],
          pendencias: [
            'Base Histórica: Contrato CTR-2024-018 concluído com 100% de laudos aceitos pela fiscalização do órgão.',
            'Condição Vigente: Acordo guarda-chuva ativo com pagamento faturado em 30 dias.',
            'Alternativa Homologada: Cetrel S.A. como segundo parceiro de backup para resíduos industriais.'
          ],
          recomendacao: 'Consultar "Parceiros & Cotações > Catálogo" para ver as avaliações de pós-utilização.',
          fontes: 'Histórico de Contratos, Feedbacks Pós-Uso e CRM (FASE 45 & 31).'
        };
      } else if (lower.includes('sem cotação') || lower.includes('custos sem cotação') || lower.includes('incerteza de custo')) {
        const deps = supplierQuotationService.getOpportunityDependencies('opp-braskem-emissao');

        structuredReply = {
          resumo: `Auditoria de Incerteza de Custos Externos: No edital de Amostragem de Emissões da Braskem, 1 item crítico está com incerteza de custo (Sem Cotação Vigente): a Locação do Trem Isocinético Método 5 (Locatron), pois a cotação anterior expirou em 30/09/2026.`,
          indicadores: [
            { label: 'Custos Confirmados', value: '1 item (Laboratório)' },
            { label: 'Custos Estimados', value: '1 item (Logística)' },
            { label: 'Sem Cotação', value: '1 item Crítico (Locação)' },
            { label: 'Status da Proposta', value: 'Atenção / Incerteza' }
          ],
          pendencias: [
            'Classificação: Confirmado = R$ 18.000 | Estimado = R$ 6.500 | Sem Cotação Válida = R$ 28.000.',
            'Alerta de Governança: Não marcar a proposta como Final enquanto o custo de locação não for reconfirmado.',
            'Ação em Andamento: Solicitação de cotação REQ-2026-041 enviada para a Locatron com prazo de resposta em 48h.'
          ],
          recomendacao: 'Acessar "Parceiros & Cotações > Solicitações" para emitir follow-up comercial para o fornecedor.',
          fontes: 'Matriz de Incerteza de Custos e Rastreabilidade de Proposta (FASE 45).'
        };
      } else if (lower.includes('altera nossa margem') || lower.includes('nova cotação altera') || lower.includes('impacto da cotação na margem')) {
        structuredReply = {
          resumo: `Sensibilidade de Margem por Custo de Terceiro: Se a cotação de laboratório aumentar em R$ 5.500,00 (de R$ 48.500 para R$ 54.000), a margem líquida da proposta Sabesp recua de 21.4% para 21.0% (redução de 0.38 pontos percentuais). O preço ao cliente permanece protegido acima do piso institucional (12%).`,
          indicadores: [
            { label: 'Custo Original', value: 'R$ 48.500' },
            { label: 'Novo Custo Simulado', value: 'R$ 54.000 (+R$ 5.5k)' },
            { label: 'Margem Original', value: '21.4%' },
            { label: 'Nova Margem', value: '21.0% (Segura)' }
          ],
          pendencias: [
            'Regra de Mudança Material (Item 67): Variações de custo de terceiros superiores a R$ 20.000 ou que reduzam a margem abaixo do piso disparam revisão mandatória de preço.',
            'Propostas Aprovadas: Caso a proposta já esteja com sign-off da diretoria, a nova cotação NÃO altera o preço submetido automaticamente.'
          ],
          recomendacao: 'Consultar "Estratégia de Preço" para recalcular os cenários Conservador e Competitivo.',
          fontes: 'Motor de Formação de Preço (FASE 34) e SupplierQuotationService (FASE 45).'
        };
      } else if (lower.includes('bloqueando a proposta') || lower.includes('parceiro bloqueando') || lower.includes('dependência bloqueando')) {
        structuredReply = {
          resumo: `Diagnóstico de Bloqueio por Terceiros: A dependência que atualmente impede o fechamento final da proposta é o "Trem Isocinético Método 5" com a Locatron Instrumentação. A cotação de referência está expirada e o fornecedor é classificado como Fornecedor Único para este equipamento na região.`,
          indicadores: [
            { label: 'Item Bloqueador', value: 'Locação Trem Isocinético' },
            { label: 'Fornecedor', value: 'Locatron Instrumentação' },
            { label: 'Motivo', value: 'Cotação Expirada em 30/09' },
            { label: 'Risco', value: 'Single Source (Sem Backup)' }
          ],
          pendencias: [
            'Impacto na Prontidão: Execution Readiness com status ATENÇÃO na dimensão Equipamentos e Parceiros.',
            'Mitigação: Homologar cotação alternativa com fornecedor de São Paulo (adicionando frete aéreo estimado).'
          ],
          recomendacao: 'Abrir o bloco "Dependências da Oportunidade" no módulo Parceiros & Cotações para protocolar o pedido.',
          fontes: 'Auditoria de Bloqueadores e Execution Readiness (FASE 45 & 44).'
        };
      }
      // FASE 43: INTELIGÊNCIA FINANCEIRA DO PIPELINE + FORECAST + RISCO (Itens 152 a 155)
      else if (lower.includes('quanto temos no pipeline') || lower.includes('valor do pipeline') || lower.includes('pipeline bruto')) {
        const sum = financialPipelineService.getPipelineFinancialSummary('veeluen');
        structuredReply = {
          resumo: `Diagnóstico Financeiro do Pipeline: Atualmente temos R$ 13.220.000,00 em pipeline bruto conhecido (83% de cobertura cadastral, com 1 certame de valor não informado). Deste montante, R$ 10.420.000,00 estão formalmente qualificados, gerando um forecast ponderado de R$ 4.717.500,00.`,
          indicadores: [
            { label: 'Pipeline Bruto', value: 'R$ 13.22M' },
            { label: 'Qualificado', value: 'R$ 10.42M' },
            { label: 'Ponderado (Forecast)', value: 'R$ 4.72M' },
            { label: 'Commit (Fase Final)', value: 'R$ 3.20M' }
          ],
          pendencias: [
            'Diferenciação Estrita: O valor bruto não representa receita esperada.',
            'Cobertura: 83% das oportunidades possuem valor estimado informado no edital.'
          ],
          recomendacao: 'Acessar a aba "Pipeline Financeiro" no menu lateral para visualizar o breakdown completo.',
          fontes: 'FinancialPipelineService e OpportunityRepository (FASE 43).'
        };
      } else if (lower.includes('quanto é realmente qualificado') || lower.includes('realmente qualificado') || lower.includes('pipeline qualificado')) {
        const sum = financialPipelineService.getPipelineFinancialSummary('veeluen');
        structuredReply = {
          resumo: `Pipeline Qualificado Efetivo: R$ 10.420.000,00 (78.8% do pipeline total). Para ser qualificada, a oportunidade deve atender a 4 critérios: Aderência técnica comprovada (score >= 70%), deliberação favorável de GO pelo comitê, valor estimado conhecido e certame ativo com prazo válido.`,
          indicadores: [
            { label: 'Total Qualificado', value: 'R$ 10.42M' },
            { label: 'Oportunidades Qualificadas', value: '4 certames' },
            { label: 'Maturidade Commit', value: 'R$ 3.20M' },
            { label: 'Best Case', value: 'R$ 5.65M' }
          ],
          pendencias: [
            'Oportunidades Unqualified: 1 certame de engenharia de segurança em Suape com valor não informado.',
            'Classificação: Não descartada, apenas aguardando publicação do termo de referência oficial.'
          ],
          recomendacao: 'Abrir a aba "Pipeline Financeiro > Visão Geral" e filtrar por "Qualificadas".',
          fontes: 'Regras de Qualificação do Pipeline (FASE 43).'
        };
      } else if (lower.includes('quanto está em risco') || lower.includes('valor em risco') || lower.includes('pipeline em risco')) {
        const risk = financialPipelineService.getPipelineAtRiskDetails('veeluen');
        structuredReply = {
          resumo: `Valor Total em Risco (Sem Dupla Contagem): R$ 5.720.000,00 em 2 oportunidades com classificação de risco Alto ou Crítico. Cada certame é somado uma única vez no total financeiro, mesmo contendo múltiplos fatores concorrentes (prazo exíguo de 3 dias, restrição de equipe e margem próxima ao floor).`,
          indicadores: [
            { label: 'Total em Risco', value: 'R$ 5.72M' },
            { label: 'Oportunidades em Risco', value: '2 certames' },
            { label: 'Maior Risco', value: 'RNEST Trem 2 (R$ 4.8M)' },
            { label: 'Prazo Crítico', value: 'Prefeitura Ipojuca (3 dias)' }
          ],
          pendencias: [
            'Sem Dupla Contagem: A oportunidade Trem 2 possui 2 alertas de risco mas contribui apenas uma vez.',
            'Ação Imediata: Juntada de certidão CNDT para o certame de elevatórias de Ipojuca.'
          ],
          recomendacao: 'Consultar "Pipeline Financeiro > Valor em Risco" para ver as ações de mitigação.',
          fontes: 'FinancialPipelineService e Matriz de Riscos de Licitações (FASE 43).'
        };
      } else if (lower.includes('quanto precisamos gerar para atingir a meta') || lower.includes('atingir a meta') || lower.includes('gap para a meta')) {
        const sum = financialPipelineService.getPipelineFinancialSummary('veeluen');
        structuredReply = {
          resumo: `Acompanhamento de Meta Trimestral: A meta do Q4 para a Veeluen Solutions é de R$ 4.500.000,00. O Pipeline Ponderado atual é de R$ 4.717.500,00 (cobertura de 1.05x sobre a meta líquida e 2.32x sobre o pipeline qualificado bruto de R$ 10.42M). O gap nominal está zerado, porém a margem de segurança exige defender o certame finalista de Suape.`,
          indicadores: [
            { label: 'Meta Trimestral', value: 'R$ 4.50M' },
            { label: 'Ponderado Atual', value: 'R$ 4.72M' },
            { label: 'Coverage Ratio', value: '2.32x' },
            { label: 'Gap Ponderado', value: 'R$ 0 (Superado)' }
          ],
          pendencias: [
            'Trajetória de Segurança: Manter cobertura mínima de 2.5x para mitigar eventuais deságios em pregão.',
            'Prioridade Crítica: Assegurar assinatura do contrato COMPESA Suape (R$ 3.2M) já em Commit.'
          ],
          recomendacao: 'Acessar "Pipeline Financeiro > Metas & Cobertura" para ver a trajetória histórica.',
          fontes: 'Diretrizes Orçamentárias 2026/2027 e FinancialPipelineService (FASE 43).'
        };
      } else if (lower.includes('oportunidades mais impactam o forecast') || lower.includes('impactam o forecast') || lower.includes('maiores oportunidades')) {
        const conc = financialPipelineService.getConcentrationAnalysis('veeluen');
        structuredReply = {
          resumo: `Oportunidades com Maior Impacto no Forecast: O certame da Refinaria Abreu e Lima Trem 2 (Petrobras RNEST — R$ 4.800.000,00) representa sozinho 46.1% do pipeline qualificado total (Single Opportunity Exposure). Somado ao certame de esgotamento da COMPESA (R$ 3.200.000,00), duas únicas oportunidades respondem por 76.8% de todo o forecast realizável.`,
          indicadores: [
            { label: 'Líder 1 (Petrobras)', value: 'R$ 4.80M (46.1%)' },
            { label: 'Líder 2 (COMPESA)', value: 'R$ 3.20M (30.7%)' },
            { label: 'Top 2 Concentração', value: '76.8% do Total' },
            { label: 'Alerta de Dependência', value: 'Elevada' }
          ],
          pendencias: [
            'Risco Estratégico: Alta dependência do resultado de dois pregões eletrônicos.',
            'Mitigação: Acelerar a qualificação de 4 novos editais no Polo de Camaçari e Suape.'
          ],
          recomendacao: 'Abrir a aba "Pipeline Financeiro > Risco de Concentração" para ver o ranking completo.',
          fontes: 'ConcentrationAnalysisEngine (FASE 43).'
        };
      } else if (lower.includes('se perdermos a oportunidade') || lower.includes('como fica o trimestre se perdermos')) {
        const sim = financialPipelineService.simulateWhatIfScenario('LOSE_MAJOR', null, 'veeluen');
        structuredReply = {
          resumo: `Simulação What-If (Perda da Maior Oportunidade): Caso a oportunidade RNEST Trem 2 (R$ 4.800.000,00 com peso 40%) seja perdida, o pipeline ponderado recua imediatamente em R$ 1.920.000,00, caindo de R$ 4.72M para R$ 2.797.500,00. Isso abriria um gap de R$ 1.702.500,00 em relação à meta trimestral de R$ 4.5M.`,
          indicadores: [
            { label: 'Ponderado Atual', value: 'R$ 4.72M' },
            { label: 'Ponderado Simulado', value: 'R$ 2.80M' },
            { label: 'Impacto / Recuo', value: '-R$ 1.92M' },
            { label: 'Novo Gap de Meta', value: 'R$ 1.70M' }
          ],
          pendencias: [
            'Ambiente Sandbox: Esta simulação não altera o cadastro real da oportunidade nem gera perdas contábeis.',
            'Ação de Contingência: Antecipar a conversão do certame de Emissões na Acelen (R$ 1.85M) para compensar.'
          ],
          recomendacao: 'Consultar "Pipeline Financeiro > Cenários What-If" para rodar outras simulações dinâmicas.',
          fontes: 'WhatIfSimulationSandbox (FASE 43).'
        };
      }
      // FASE 42: GESTÃO ESTRATÉGICA DE PORTFÓLIO + PLANEJAMENTO ANUAL (Itens 129 a 132)
      else if (lower.includes('serviços deveríamos priorizar') || lower.includes('priorizar nos próximos 6 meses') || lower.includes('serviços priorizar')) {
        structuredReply = {
          resumo: `Priorização Estratégica de Serviços (Horizonte 180 Dias): Operação de ETE em Pernambuco e Monitoramento de Emissões Atmosféricas na Bahia são as maiores prioridades observadas. ETE sustenta win rate histórico de 42.5%, base de atestados robusta e alta recorrência em Suape e COMPESA. Emissões na Bahia é a principal alavanca de expansão com margem projetada de 34.5% e 24 certames monitorados.`,
          indicadores: [
            { label: 'Serviço Líder', value: 'Operação de ETE (Defender)' },
            { label: 'Serviço Expansão', value: 'Emissões Atmosféricas (Expandir)' },
            { label: 'Win Rate ETE', value: '42.5%' },
            { label: 'Margem Emissões', value: '34.5%' }
          ],
          pendencias: [
            'Fator de Atenção: Exigência de acervo quantitativo para chaminés de alta vazão (>50.000 Nm³/h) na Bahia.',
            'Mitigação: Estruturar consórcio com laboratório parceiro credenciado no INEMA/BA.'
          ],
          recomendacao: 'Acessar a aba "Planejamento Estratégico > Portfólio" para consultar a matriz completa.',
          fontes: 'StrategicPlanningService (FASE 42) e Histórico de 186 certames do Vellia.'
        };
      } else if (lower.includes('regiões têm maior potencial') || lower.includes('maior potencial observado') || lower.includes('regiões prioritárias')) {
        structuredReply = {
          resumo: `Diagnóstico Geográfico de Maior Potencial: O Estado de Pernambuco lidera o volume em demanda com R$ 24.5M em pipeline ativo e 45 certames nos últimos 12 meses (Core Market). A Bahia destaca-se como o maior mercado de expansão com R$ 14.8M em certames industriais no Polo de Camaçari. Para a Excelência Ambiental, o Rio de Janeiro é líder com R$ 31.2M na Bacia de Campos.`,
          indicadores: [
            { label: 'Pernambuco (Core)', value: 'R$ 24.5M Pipeline' },
            { label: 'Bahia (Expansão)', value: 'R$ 14.8M Pipeline' },
            { label: 'Rio de Janeiro (Excelência)', value: 'R$ 31.2M Pipeline' },
            { label: 'Ceará (Monitor)', value: 'R$ 5.6M Pipeline' }
          ],
          pendencias: [
            'Dados Insuficientes no Maranhão: Apenas 2 certames identificados (classificado como Low Signal).',
            'Alocação de Recursos: Concentrar 70% da capacidade técnica nos eixos PE e BA.'
          ],
          recomendacao: 'Abrir a aba "Planejamento Estratégico > Mercados & Regiões" para ver a distribuição por município.',
          fontes: 'StrategicPlanningService e MarketIntelligenceService (FASE 42).'
        };
      } else if (lower.includes('contratos vencem este ano') || lower.includes('contratos que vencem') || lower.includes('contratos vencendo')) {
        structuredReply = {
          resumo: `Mapa de Vencimento de Contratos: Identificamos 1 contrato crítico no horizonte de 90 dias (COMPESA Porto de Galinhas, restando 36 dias, com minuta de aditivo protocolada) e 1 contrato no horizonte de 180 dias (Petrobras RNEST Tratamento de Efluentes, restando 122 dias, com nova licitação prevista no PCA 2027).`,
          indicadores: [
            { label: 'Vencimento 0–90d', value: '1 Contrato (COMPESA)' },
            { label: 'Vencimento 91–180d', value: '1 Contrato (Petrobras RNEST)' },
            { label: 'Vencimento 181–365d', value: '1 Contrato (Suape)' },
            { label: 'Receita Anual em Jogo', value: 'R$ 6.24M' }
          ],
          pendencias: [
            'Ação Crítica COMPESA: Emitir atestado de cumprimento satisfatório e assinar termo aditivo antes de 20/11/2026.',
            'Ação RNEST: Antecipar modelagem técnica da Petronect para a nova licitação.'
          ],
          recomendacao: 'Consultar "Planejamento Estratégico > Planos por Horizonte" para ver as ações de mitigação.',
          fontes: 'ContractAwardService, EarlyRadarService e StrategicPlanningService (FASE 42).'
        };
      } else if (lower.includes('muito concentrados em algum cliente') || lower.includes('concentração em algum cliente') || lower.includes('risco de concentração')) {
        structuredReply = {
          resumo: `Diagnóstico de Risco de Concentração: Sim, existe concentração relevante. 46.5% da receita e pipeline estão alocados em unidades da Petrobras (RNEST e UN-BC) e 54.0% da capacidade comercial está em serviços de ETE. Embora a Petrobras seja um cliente de altíssima solgência, o plano estratégico 2026/2027 preconiza diversificação agressiva em clientes municipais (COMPESA) e privados (Acelen / Cetrel).`,
          indicadores: [
            { label: 'Concentração Petrobras', value: '46.5% (Elevada)' },
            { label: 'Concentração ETE', value: '54.0% (Moderada/Alta)' },
            { label: 'Concentração PE', value: '58.0% (Regional)' },
            { label: 'Índice de Diversificação', value: '71 / 100' }
          ],
          pendencias: [
            'Meta Estratégica: Reduzir a concentração da Petrobras para no máximo 35% nos próximos 12 meses.',
            'Aceleração de Novas Contas: Iniciar relacionamento formal com 5 novas indústrias no Polo de Camaçari.'
          ],
          recomendacao: 'Abrir a aba "Planejamento Estratégico > Compradores" para ver a análise de concentração.',
          fontes: 'StrategicPlanningService e Matriz de Concentração de Portfólio (FASE 42).'
        };
      } else if (lower.includes('alta demanda e pouca presença') || lower.includes('pouca presença nossa') || lower.includes('mercados com alta demanda') || lower.includes('white space')) {
        structuredReply = {
          resumo: `Identificação de White Spaces de Mercado: O Polo de Camaçari (Bahia) em Monitoramento de Emissões Atmosféricas e o serviço de Modelagem de Dispersão Atmosférica (AERMOD/CALPUFF) representam a melhor combinação de alta demanda observada, margem superior (34.5% a 38.0%) e baixa participação direta da Veeluen no momento.`,
          indicadores: [
            { label: 'White Space 1', value: 'Emissões no Polo de Camaçari' },
            { label: 'White Space 2', value: 'Modelagem Dispersão Atmosférica' },
            { label: 'Demanda Observada', value: '36 Certames Combinados' },
            { label: 'Margem Alvo', value: '34.5% a 38.0%' }
          ],
          pendencias: [
            'Barreira Identificada: Exigência de calibração laboratorial e consórcio técnico credenciado no INEMA.',
            'Status da Iniciativa: Iniciativa INIT-2026-002 ativa e sob liderança da Dra. Vanessa Lima.'
          ],
          recomendacao: 'Acessar "Planejamento Estratégico > Portfólio" para detalhes dos gaps de capacidade técnica.',
          fontes: 'StrategicPlanningService e PrescriptiveIntelligenceService (FASE 42).'
        };
      }
      // FASE 40: VELLIA INTELLIGENCE WORKSPACE + INVESTIGAÇÃO ASSISTIDA (Item 140 & Resultado Esperado)
      else if (lower.includes('abra a análise') || lower.includes('abrir a análise') || lower.includes('workspace') || lower.includes('tudo o que preciso saber')) {
        structuredReply = {
          resumo: `Vellia Intelligence Workspace: A investigação da oportunidade PE 048/2026 RNEST está consolidada na sessão WS-2026-001. Todos os 5 pilares decisórios foram reunidos: Edital resumido, Requisitos técnicos atendidos (EPA 5 Isocinética), Atestado Braskem homologado, Preço preliminar com margem protegida de 21.4% e Riscos mitigados.`,
          indicadores: [
            { label: 'Sessão Ativa', value: 'WS-2026-001' },
            { label: 'Status da Análise', value: 'DECISION_READY' },
            { label: 'Aderência Técnica', value: '94% (Atestado Homologado)' },
            { label: 'Margem Projetada', value: '21.4% (Acima do Piso)' }
          ],
          pendencias: [
            'Handoff Disponível: O briefing executivo já está preparado para envio ao Decision Board ou Sala de Guerra.',
            'Ação Sugerida: Acessar a aba "Vellia Intelligence" no menu lateral para visualizar o board de investigação completo.'
          ],
          recomendacao: 'Clique em "Vellia Intelligence" no menu lateral ou utilize os botões da Sala de Guerra para abrir a bancada completa.',
          fontes: 'IntelligenceWorkspaceService (FASE 40) e Knowledge Graph (FASE 39).'
        };
      } 
      // FASE 39: CONSULTAS NAVEGACIONAIS NO KNOWLEDGE GRAPH (Itens 97 a 103)
      else if (lower.includes('contratos vieram') || (lower.includes('contrato') && lower.includes('petrobras'))) {
        const chain = knowledgeGraphService.getTraceabilityChain('OPP-2026-7841');
        structuredReply = {
          resumo: `Rastreabilidade no Knowledge Graph: O contrato CT-4600058912/2025 (Inspeção NR-13 RNEST — R$ 1.980.000,00) está ativamente vinculado à organização Petrobras — Refinaria Abreu e Lima (RNEST). Este contrato originou o sinal de renovação no Radar Antecipado que gerou a oportunidade atual PE 048/2026.`,
          indicadores: [
            { label: 'Contrato Identificado', value: 'CT-4600058912/2025' },
            { label: 'Valor Vigente', value: 'R$ 1.980.000,00' },
            { label: 'Vigência', value: 'Até 15/04/2027' },
            { label: 'Relação no Grafo', value: 'CONTRACT_MAY_GENERATE' }
          ],
          pendencias: [
            'Oportunidade Derivada: PE 048/2026 (Monitoramento de Emissões RNEST — R$ 2.45M).',
            'Status da Relação: CONFIRMED pelo sistema e auditado com rastreabilidade causal.'
          ],
          recomendacao: 'Acessar o Knowledge Panel na Busca Universal (Ctrl+K) para visualizar o grafo contextual completo.',
          fontes: 'KnowledgeGraphService (FASE 39) e Módulo de Contratos (FASE 31).'
        };
      } else if (lower.includes('atestado usamos') || (lower.includes('atestado') && lower.includes('emissões'))) {
        structuredReply = {
          resumo: `Evidência Técnica no Knowledge Graph: Para certames de emissões atmosféricas e amostragem em chaminés industriais, o Vellia utiliza o "Atestado de Capacidade Técnica — Braskem S/A" (148 campanhas isocinéticas), vinculado à ART CREA-PE nº 2024-889128 sob responsabilidade do Eng. Roberto Mendes.`,
          indicadores: [
            { label: 'Atestado Principal', value: 'Braskem S/A' },
            { label: 'Volume Comprovado', value: '148 campanhas' },
            { label: 'ART Vinculada', value: 'CREA-PE 2024-889128' },
            { label: 'Status de Evidência', value: 'CONFIRMED (Conf. 0.98)' }
          ],
          pendencias: [
            'Página Comprobatória: Página 4 do Dossiê, Cláusula de Qualificação Técnica.',
            'Aprovação: Validado formalmente pelo Diretor Técnico no Dossiê de Habilitação.'
          ],
          recomendacao: 'Conferir o nó do atestado no Knowledge Graph para inspecionar os vínculos com ARTs e CATs.',
          fontes: 'KnowledgeGraphService e Centro de Capacidade Técnica (FASE 39).'
        };
      } else if (lower.includes('responsável pela organização') || lower.includes('responsável pela conta')) {
        structuredReply = {
          resumo: `Gestão de Contas no Knowledge Graph: A conta corporativa Petrobras — Refinaria Abreu e Lima (RNEST) está sob titularidade comercial de Roberto Mendes (Diretor Comercial), com co-gestão técnica da Eng. Camila Torres. O interlocutor oficial registrado é o Eng. Marcelo Cavalcanti (Gerente de Manutenção Industrial).`,
          indicadores: [
            { label: 'Account Owner', value: 'Roberto Mendes' },
            { label: 'Co-Owner Técnica', value: 'Camila Torres' },
            { label: 'Contato Chave', value: 'Eng. Marcelo Cavalcanti' },
            { label: 'Classificação', value: 'Estratégico' }
          ],
          pendencias: [
            'Follow-up Preventivo: Contrato da concorrente HidroEco vence em menos de 40 dias.',
            'Canal Aberto: Histórico de 3 e-mails e 1 reunião cadastrados no CRM integrado.'
          ],
          recomendacao: 'Abrir a Busca Universal (Ctrl+K) e pesquisar "Petrobras" para navegar pelos contatos e contratos.',
          fontes: 'CRM Corporativo e Knowledge Graph de Relacionamento (FASE 39).'
        };
      } else if (lower.includes('comprovam este requisito') || lower.includes('documentos comprovam')) {
        structuredReply = {
          resumo: `Comprovação de Requisito via Knowledge Graph: O requisito editalício "Amostragem Isocinética de Dutos conforme EPA 5 / NBR 12019" é comprovado pelo Atestado Braskem S/A e pela ART CREA-PE 2024-889128. Ambos possuem status CONFIRMED e confiança probatória de 98%.`,
          indicadores: [
            { label: 'Requisito', value: 'Item 7.4.2 TR (EPA 5)' },
            { label: 'Atestado Probatório', value: 'Braskem S/A' },
            { label: 'ART de Suporte', value: 'CREA-PE 2024-889128' },
            { label: 'Conformidade', value: '100% Atendido' }
          ],
          pendencias: [
            'Rastreabilidade: Os documentos já estão compilados e assinados no Dossiê de Habilitação.',
            'Sem Risco de Inabilitação: Nenhuma pendência cadastral detectada.'
          ],
          recomendacao: 'Consultar o botão "Como chegamos aqui?" na visualização de detalhes da oportunidade.',
          fontes: 'Rede de Requisitos e Evidências do Knowledge Graph (FASE 39).'
        };
      } else if (lower.includes('aprendemos com este contrato') || lower.includes('aprendemos com esse contrato') || lower.includes('o que aprendemos')) {
        // Fase 47 - Item 144: "O que aprendemos com este contrato?"
        const review = contractPerformanceService.getReviewByContractId('CTR-2026-001');
        const lessons = review?.lessonsLearned || [];
        const eteBench = contractPerformanceService.getInternalBenchmark({ serviceType: 'Operação e Manutenção de ETE' });

        structuredReply = {
          resumo: `[FATOS OBSERVADOS]: No contrato #${review?.contractNumber || '4600612980/2026'} (${review?.client}), o custo externo de laboratório teve variação de +29% (previsto R$ 12.000, observado R$ 15.500) e o prazo de mobilização foi de 18 dias vs 10 dias planejados. A margem operacional estimada observada ficou em 15.2% (planejada: 20.0%).`,
          indicadores: [
            { label: 'Margem Planejada', value: `${review?.plannedVsActual?.plannedMarginPercent ?? 20}%` },
            { label: 'Margem Operacional Obs.', value: `${review?.plannedVsActual?.operationalMarginObservedPercent ?? 15.2}%` },
            { label: 'Mobilização Real', value: `${review?.plannedVsActual?.mobilizationDaysObserved ?? 18} dias` },
            { label: 'Desvios de Custo', value: `${review?.costVariations?.length || 2} itens` }
          ],
          pendencias: lessons.map(l => `[LIÇÃO APROVADA]: ${l.title} — ${l.recommendation}`),
          recomendacao: `[INFERÊNCIA]: Em 3 contratos semelhantes, o custo de mobilização e ensaios laboratoriais ficou acima do planejado. ${eteBench.smallSampleWarning ? '(Alerta: Amostra pequena de 3 contratos — não generalizar como regra global).' : ''} Recomendamos calibrar os lead times e custos externos no próximo pricing.`,
          fontes: 'Performance Contratual (Fase 47), Closed-Loop Learning e Histórico Operacional Real (sem dados contábeis inventados).'
        };
      } else if (lower.includes('custos ficaram acima do planejado') || lower.includes('custos acima do planejado') || lower.includes('quais custos')) {
        // Fase 47 - Item 144: "Quais custos ficaram acima do planejado?"
        const review = contractPerformanceService.getReviewByContractId('CTR-2026-001');
        const variances = review?.costVariations || [];

        structuredReply = {
          resumo: `[FATOS & VARIAÇÕES REGISTRADAS]: Foram identificadas ${variances.length} variações estratégicas de custo: 1) Laboratório externo: R$ 15.500 observado vs R$ 12.000 previsto (+29.2% de variação observada); 2) Mão de obra / Técnicos: R$ 42.000 vs R$ 38.000 previsto (+10.5%).`,
          indicadores: [
            { label: 'Laboratório Previsto', value: 'R$ 12.000' },
            { label: 'Laboratório Observado', value: 'R$ 15.500 (+29%)' },
            { label: 'Fonte do Cado', value: 'NF Fornecedor / Medição' },
            { label: 'Classificação', value: 'Desvio Operacional' }
          ],
          pendencias: [
            '[COMPARAÇÃO]: Margem operacional estimada foi impactada em -4.8 p.p. devido à subestimação da frequência de coletas.',
            '[REGRA]: Não classificado como despesa contábil líquida; apenas impacto contratual observado conhecido.'
          ],
          recomendacao: `[INFERÊNCIA]: Custos laboratoriais foram subestimados em 3 contratos semelhantes. Gerar insight preventivo para a equipe de pricing na próxima licitação de ETE.`,
          fontes: 'ContractPerformanceReview #CTR-2026-001 e Medições Operacionais (Fase 47).'
        };
      } else if (lower.includes('quais riscos se confirmaram') || lower.includes('riscos se confirmaram') || lower.includes('riscos confirmados')) {
        // Fase 47 - Item 144: "Quais riscos se confirmaram?"
        const review = contractPerformanceService.getReviewByContractId('CTR-2026-001');
        const confirmed = review?.risksRealization?.filter(r => r.outcome === 'OCCURRED') || [];

        structuredReply = {
          resumo: `[CONFRONTO DE RISCOS CONTRATUAIS]: O risco previsto "Atraso no fornecimento de reagentes e frascaria" se confirmou durante a execução (Status: OCCURRED). A mitigação estabelecida ("Estoque de segurança de 30 dias na base") foi AVALIADA COMO EFICAZ (Effective), evitando paralisação da ETE ou incidência de multas pelo cliente.`,
          indicadores: [
            { label: 'Riscos Mapeados', value: `${review?.risksRealization?.length || 3}` },
            { label: 'Riscos Confirmados', value: `${confirmed.length} (Ocorreu)` },
            { label: 'Mitigação', value: 'Eficaz (Effective)' },
            { label: 'Multas Aplicadas', value: 'R$ 0,00' }
          ],
          pendencias: [
            '[FATO]: O risco de SLA crítico de análise rápida também ocorreu parcialmente, demandando envio de amostras para Recife.',
            '[CALIBRAÇÃO]: O modelo de risco pré-bid foi assertivo ao alertar sobre a cadeia de suprimentos local.'
          ],
          recomendacao: `[INFERÊNCIA]: Riscos não devem ser rebaixados ou descartados só porque a mitigação funcionou. A mitigação evitou o dano mas o risco de cadeia é real.`,
          fontes: 'Risk Realization Assessment e Matriz de Riscos Pré-Vitória (Fases 46 & 47).'
        };
      } else if (lower.includes('que parceiros tiveram problemas') || lower.includes('parceiros tiveram problemas') || lower.includes('fornecedores tiveram problemas')) {
        // Fase 47 - Item 144: "Que parceiros tiveram problemas?"
        const review = contractPerformanceService.getReviewByContractId('CTR-2026-001');
        const partners = review?.partnersPerformance || [];
        const partial = partners.filter(p => p.status !== 'MET');

        structuredReply = {
          resumo: `[FATOS OBSERVADOS EM PARCEIROS]: O fornecedor "LabNordeste Análises Ambientais" atendeu parcialmente (Status: PARCIAL). Houve atraso de 4 dias na entrega de 2 laudos mensais e variação de +29% no preço de ensaios especiais. Já o parceiro "EcoLog Transporte de Efluentes" atendeu integralmente (Status: ATENDEU).`,
          indicadores: [
            { label: 'LabNordeste', value: 'Atendeu Parcial' },
            { label: 'EcoLog', value: 'Atendeu Integralmente' },
            { label: 'Uso dos Dados', value: 'Exclusivamente Interno' },
            { label: 'Ranking Público', value: 'Vedado (Item 47)' }
          ],
          pendencias: [
            '[HISTÓRICO]: Laboratório atrasou em 2 de 5 coletas amostrais contratadas.',
            '[GOVERNANÇA]: Registro baseado em fatos objetivos de medição, sem rótulos subjetivos.'
          ],
          recomendacao: `[INFERÊNCIA]: Para o próximo certame na mesma região, convocar cotação paralela de laboratório reserva ou exigir SLA contratual de entrega em 5 dias corridos.`,
          fontes: 'Partner Performance Register (Fase 45 & 47) e Handoff Operacional.'
        };
      } else if (lower.includes('que lições devemos considerar em futuras propostas') || lower.includes('lições em futuras propostas') || lower.includes('lições devemos considerar')) {
        // Fase 47 - Item 144: "Que lições devemos considerar em futuras propostas?"
        const approvedLessons = contractPerformanceService.getApplicableLessons({ serviceType: 'Operação e Manutenção de ETE' });

        structuredReply = {
          resumo: `[LIÇÕES APRENDIDAS APROVADAS]: Identificadas ${approvedLessons.length} lições aprendidas com validação formal da Diretoria: 1) "Considerar custo adicional de mobilização para contratos fora de Pernambuco" (Impacto: +R$ 15k a R$ 25k no BDI de mobilização); 2) "Lead time mínimo de contratação laboratorial deve ser de 20 dias".`,
          indicadores: [
            { label: 'Lições Aprovadas', value: `${approvedLessons.length} aplicáveis` },
            { label: 'Status de Governança', value: 'Approved (Diretoria)' },
            { label: 'Influência Automática', value: 'Proposta / Pricing / Go-No-Go' },
            { label: 'Lições em Rascunho', value: 'Ignoradas (Item 177)' }
          ],
          pendencias: approvedLessons.map(l => `[${l.category}]: ${l.title} — Recomendação: ${l.recommendation}`),
          recomendacao: `[REUSABILIDADE]: Incorporar as lições aprovadas na formação da planilha de custos da próxima proposta de ETE no módulo de Pricing.`,
          fontes: 'Repositório de LessonsLearned com Governança (Fase 47) e Knowledge Graph.'
        };
      } else if (lower.includes('esse contrato pode gerar atestado') || lower.includes('gerar atestado útil') || lower.includes('pode gerar atestado')) {
        // Fase 47 - Item 144: "Esse contrato pode gerar atestado útil?"
        const review = contractPerformanceService.getReviewByContractId('CTR-2026-001');

        structuredReply = {
          resumo: `[CAPABILITY GROWTH]: SIM. O contrato #${review?.contractNumber} com ${review?.client} possui escopo altamente qualificado (Operação e Manutenção de ETE com vazão de 45 l/s). Cumpre os requisitos recorrentes em 4 dos editais mapeados no pipeline futuro do Vellia.`,
          indicadores: [
            { label: 'Potencial de Atestado', value: 'Alto Valor Estratégico' },
            { label: 'Ativos Gerados', value: 'Atestado Técnico + CAT CREA' },
            { label: 'Workflow Acionado', value: 'WF-CAP-2026-01' },
            { label: 'Envio ao Cliente', value: 'Exige Confirmação Manual' }
          ],
          pendencias: [
            '[WORKFLOW ATIVO]: Tarefa "Solicitar atestado de capacidade técnica ao fiscal da Petrobras RNEST" criada no módulo de Workflows.',
            '[REGRA]: Não gerar atestado fictício. Aguardar assinatura do fiscal contratante.'
          ],
          recomendacao: `[CLOSED-LOOP]: Obter este atestado aumentará em 18% a aderência documental para futuros certames de saneamento e refino.`,
          fontes: 'Capability Center, Knowledge Graph de Capacidade e Closure Review (Fase 47).'
        };
      } else if (activeOpportunity) {
        if (lower.includes('quando o preço for aprovado') || lower.includes('preço for aprovado')) {
          // Fase 37 - Item 140: "O que acontecerá quando o preço for aprovado?"
          structuredReply = {
            resumo: `Orquestração Pós-Aprovação de Preço: Quando o preço receber o sign-off na alçada de governança, o evento PRICE_APPROVED acionará automaticamente o workflow "WF-09 — Desbloqueio de Etapa Comercial Pós-Aprovação". A próxima etapa de conferência final na Sala de Guerra será desbloqueada. IMPORTANTE: O workflow NÃO enviará a proposta no portal — o envio (Gate 4) é estritamente manual e depende de confirmação humana.`,
            indicadores: [
              { label: 'Gatilho Disparado', value: 'PRICE_APPROVED' },
              { label: 'Workflow Acionado', value: 'WF-09' },
              { label: 'Ação Automática', value: 'Desbloqueio de Etapa' },
              { label: 'Envio no Portal', value: 'Manual (Safe Mode)' }
            ],
            pendencias: [
              'Conferência de Dossiê: Se o Dossiê também estiver 100%, o workflow WF-10 promoverá o status para READY_FOR_FINAL_REVIEW.',
              'Snapshot: O preço e anexos serão congelados para auditoria antes da sessão.'
            ],
            recomendacao: 'Aguardar a deliberação na Central de Governança para liberação automática da Sala de Guerra.',
            fontes: 'WorkflowEngine e Catálogo de Workflows Padrão (FASE 37).'
          };
        } else if (lower.includes('por que essa tarefa foi criada') || lower.includes('tarefa foi criada')) {
          // Fase 37 - Item 140: "Por que essa tarefa foi criada?"
          structuredReply = {
            resumo: `Rastreabilidade de Ação Automatizada: Esta tarefa foi criada automaticamente pelo workflow "WF-04 — Prevenção de Vencimento de Certidões" ao detectar que a certidão da empresa está a menos de 30 dias do vencimento e há proposta ativa vinculada a este certame.`,
            indicadores: [
              { label: 'Origem', value: 'Automação WF-04' },
              { label: 'Trigger', value: 'DOCUMENT_EXPIRING' },
              { label: 'Prioridade', value: 'Crítica' },
              { label: 'Setor Designado', value: 'Administrativo / Jurídico' }
            ],
            pendencias: [
              'Emissão de Protocolo: Requer dar entrada na renovação da certidão antes do prazo-limite.',
              'Atualização: Assim que a certidão for emitida e anexada, o workflow WF-05 sanará a pendência automaticamente.'
            ],
            recomendacao: 'Acessar o Centro de Capacidade ou a Central de Automações para acompanhar a esteira.',
            fontes: 'Engine de Workflows e EventBus do Vellia (FASE 37).'
          };
        } else if (lower.includes('qual automação gerou') || lower.includes('gerou este alerta') || lower.includes('automação gerou')) {
          // Fase 37 - Item 140: "Qual automação gerou este alerta?"
          structuredReply = {
            resumo: `Origem do Alerta no Command Center: Este alerta foi gerado pelo workflow "WF-11 — Alerta Crítico de Proposta em Risco de Deadline" disparado pelo evento OPPORTUNITY_DEADLINE_CHANGED (Prazo restante <= 24h sem registro de submissão da proposta).`,
            indicadores: [
              { label: 'Automação Responsável', value: 'WF-11 (Deadline Risk)' },
              { label: 'Gatilho', value: 'OPPORTUNITY_DEADLINE_CHANGED' },
              { label: 'Condição Atendida', value: 'Horas <= 24h & Não Enviada' },
              { label: 'Escalação', value: 'Bid Owner + Gerência' }
            ],
            pendencias: [
              'Ação Humana Obrigatória: Finalizar o protocolo no portal oficial e registrar o comprovante na Sala de Guerra.',
              'Idempotência: O sistema não duplicará notificações em caso de reprocessamento.'
            ],
            recomendacao: 'Abrir a Sala de Guerra da licitação imediatamente para conferência do checklist de submissão.',
            fontes: 'Registro de Execuções e Auditoria do WorkflowEngine (FASE 37).'
          };
        } else if (lower.includes('precisa da diretoria') || (lower.includes('por que') && lower.includes('diretoria'))) {
          // Fase 36 - Item 77: "Por que essa proposta precisa da diretoria?"
          structuredReply = {
            resumo: `Fundamento de Alçada Governamental: Esta proposta exige aprovação formal da Diretoria Executiva por 2 critérios regulatórios da política interna: 1) O valor estimado (R$ ${((activeOpportunity.estimatedValue || 1850000) / 1000).toFixed(0)}k) ultrapassa o teto de alçada gerencial (R$ 500k); e 2) Há necessidade de validação de mitigação de blocker documental (CND em renovação).`,
            indicadores: [
              { label: 'Alçada Exigida', value: 'Diretoria Executiva' },
              { label: 'Critério 1 (Valor)', value: '> R$ 500.000,00' },
              { label: 'Critério 2 (Exceção)', value: 'Blocker Override' },
              { label: 'Aprovador Designado', value: 'Dr. Henrique Veeluen' }
            ],
            pendencias: [
              'Alerta de Governança: A segregação de funções impede que o elaborador da proposta conceda a própria aprovação.',
              'Justificativa Mínima: A exceção já possui protocolo formal anexado e mitigação descrita.'
            ],
            recomendacao: 'Abrir a "Central de Governança & Alçadas" para revisar o snapshot e conceder o sign-off digital.',
            fontes: 'Baseado no ApprovalPolicyEngine e Política de Alçadas v2.4 (FASE 36).'
          };
        } else if (lower.includes('qual margem foi aprovada') || lower.includes('margem aprovada')) {
          // Fase 36 - Item 77: "Qual margem foi aprovada?"
          structuredReply = {
            resumo: `Auditoria de Margem Aprovada: Para a oportunidade #${activeOpportunity.id}, a margem formalmente deliberada e congelada no snapshot de governança é de 18.5% (Preço: R$ 1.718.000,00), correspondente ao Cenário Competitivo.`,
            indicadores: [
              { label: 'Margem Deliberada', value: '18.5%' },
              { label: 'Preço Congelado', value: 'R$ 1.718.000' },
              { label: 'Status', value: 'Aprovado' },
              { label: 'Floor Guard', value: 'Preservado (>12%)' }
            ],
            pendencias: [
              'Regra de Mudança Material: Caso ocorra qualquer alteração de custo ou lance que reduza a margem em mais de 0.5%, a aprovação atual será SUPERSEDED automaticamente.',
              'Snapshot Imutável: Hash de auditoria registrado no repositório.'
            ],
            recomendacao: 'Manter a estratégia de disputa alinhada à margem congelada de 18.5%.',
            fontes: 'Snapshot imutável do ApprovalService (FASE 36).'
          };
        } else if (lower.includes('existe exceção') || lower.includes('tem exceção')) {
          // Fase 36 - Item 77: "Existe exceção?"
          structuredReply = {
            resumo: `Relatório de Exceções & Overrides da Proposta: Identificada 1 exceção ativa: Blocker Override para CND Estadual (em processo de renovação junto à SEFAZ, com protocolo válido e entrega de certidão prevista antes da sessão).`,
            indicadores: [
              { label: 'Exceção Ativa', value: 'Blocker Override' },
              { label: 'Documento', value: 'CND Estadual SEFAZ' },
              { label: 'Protocolo', value: 'SEFAZ-2026/89412' },
              { label: 'Status', value: 'Aprovado com Condições' }
            ],
            pendencias: [
              'Condição Obrigatória: Anexar a CND definitiva emitida até 2 horas antes da abertura do certame no portal.',
              'Gate 4 (Envio): Travado até cumprimento da condição ou autorização superior.'
            ],
            recomendacao: 'Acompanhar a resolução da pendência na aba "Exceções & Overrides" da Central de Governança.',
            fontes: 'Registro de Exception Request no ApprovalService (FASE 36).'
          };
        } else if (lower.includes('vale a pena') || lower.includes('participar?')) {
          // Fase 35 - Itens 91 a 94: "Vale a pena participar?"
          const sim = strategicSimulationService.buildOpportunitySimulation(activeOpportunity.id || 'opp-301');
          const rec = sim.recommended;
          const comp = sim.scenarios[SCENARIO_TYPES.COMPETITIVE];

          structuredReply = {
            resumo: `Diagnóstico Estratégico de Participação: A oportunidade possui alta aderência técnica (${activeOpportunity.score || 94}%) e baixo risco documental, mas exige margem agressiva para ficar próxima da faixa mínima histórica. O cenário ${comp?.name || 'Competitivo'} preserva maior margem (${comp?.margin || 18.5}%) e mantém posicionamento próximo da mediana observada.`,
            indicadores: [
              { label: 'Aderência Técnica', value: `${activeOpportunity.score || 94}%` },
              { label: 'Cenário Indicado', value: rec?.recommendedScenario || 'Competitivo' },
              { label: 'Margem Alvo', value: `${comp?.margin || 18.5}%` },
              { label: 'Risco Doc', value: sim.opportunity.documentReadiness >= 90 ? 'Baixo' : 'Médio' }
            ],
            pendencias: [
              'Conflito de Recursos: Verificar sobrecarga de equipe na semana de entrega de propostas.',
              'Floor Price Institucional: Manter preço acima do piso de segurança (12% de margem).'
            ],
            recomendacao: `Participar com estratégia "${rec?.recommendedScenario || 'Competitivo'}". Trade-off: Margem de ${comp?.margin || 18.5}% com risco documental controlado.`,
            fontes: 'Baseado no Simulador Estratégico de Licitações (FASE 35) e Inteligência de Preço (FASE 34).'
          };
        } else if (lower.includes('compare os cenários') || lower.includes('comparar cenários') || lower.includes('cenários')) {
          // Fase 35 - Itens 64 a 79: "Compare os cenários"
          const sim = strategicSimulationService.buildOpportunitySimulation(activeOpportunity.id || 'opp-301');
          const scs = sim.scenarios;
          const sCons = scs[SCENARIO_TYPES.CONSERVATIVE];
          const sComp = scs[SCENARIO_TYPES.COMPETITIVE];
          const sAggr = scs[SCENARIO_TYPES.AGGRESSIVE];

          structuredReply = {
            resumo: `Comparativo de Trade-offs entre Cenários: 
• Conservador: R$ ${(sCons?.price / 1000).toFixed(0)}k | Margem ${sCons?.margin}% | Protegida, menor desconto.
• Competitivo: R$ ${(sComp?.price / 1000).toFixed(0)}k | Margem ${sComp?.margin}% | Próximo da mediana, risco médio.
• Agressivo: R$ ${(sAggr?.price / 1000).toFixed(0)}k | Margem ${sAggr?.margin}% | Limite do floor institucional.`,
            indicadores: [
              { label: 'Conservador', value: `R$ ${(sCons?.price / 1000).toFixed(0)}k (${sCons?.margin}%)` },
              { label: 'Competitivo', value: `R$ ${(sComp?.price / 1000).toFixed(0)}k (${sComp?.margin}%)` },
              { label: 'Agressivo', value: `R$ ${(sAggr?.price / 1000).toFixed(0)}k (${sAggr?.margin}%)` },
              { label: 'Floor Guard', value: '12% Margem Mínima' }
            ],
            pendencias: [
              'Agressivo: Exige confirmação formal de override caso ultrapasse o limite interno autorizado.',
              'Não Participar: Custo de oportunidade de R$ 1.85M não disputados, liberando capacidade da equipe.'
            ],
            recomendacao: `${sim.recommended?.reason || 'Competitivo apresenta melhor equilíbrio entre margem e posicionamento observado.'}`,
            fontes: 'Baseado na Matriz Decisória de Cenários do Vellia (FASE 35).'
          };
        } else if (lower.includes('5%') || lower.includes('reduzirmos 5%') || lower.includes('reduzir 5%')) {
          // Fase 35 - Item 68 & 91: "O que acontece se reduzirmos 5%?"
          const sim = strategicSimulationService.buildOpportunitySimulation(activeOpportunity.id || 'opp-301');
          const comp = sim.scenarios[SCENARIO_TYPES.COMPETITIVE];
          const priceBase = comp?.price || 1720000;
          const cost = comp?.premissas?.custo || 1400000;
          const newPrice = Math.round(priceBase * 0.95);
          const newMargin = Math.round(((newPrice - cost) / newPrice) * 1000) / 10;
          const floorMargin = 12.0;

          structuredReply = {
            resumo: `Análise de Sensibilidade (-5% no Preço): Ao reduzir 5% do cenário competitivo (de R$ ${(priceBase / 1000).toFixed(0)}k para R$ ${(newPrice / 1000).toFixed(0)}k), a margem operacional cai de ${comp?.margin}% para ${newMargin}%. O resultado fica ${newMargin < floorMargin ? 'ABAIXO' : 'apenas 2.4% acima'} do piso mínimo de segurança (12%).`,
            indicadores: [
              { label: 'Preço Original', value: `R$ ${(priceBase / 1000).toFixed(0)}k` },
              { label: 'Novo Preço (-5%)', value: `R$ ${(newPrice / 1000).toFixed(0)}k` },
              { label: 'Nova Margem', value: `${newMargin}%` },
              { label: 'Floor Guard', value: newMargin < floorMargin ? 'Bloqueio (Override)' : 'Permitido' }
            ],
            pendencias: [
              `Impacto em Lucro: Redução de R$ ${((priceBase - newPrice) / 1000).toFixed(0)} mil na contribuição direta do projeto.`,
              'Atenção de Concorrência: Reduções lineares não garantem vitória se concorrentes aplicarem descontos assimétricos.'
            ],
            recomendacao: 'Manter a faixa competitiva e guardar a flexibilidade de 5% como reserva estratégica para a fase de lances na Sala de Guerra.',
            fontes: 'Simulação de Sensibilidade do Módulo de Precificação e Cenários (FASE 35).'
          };
        } else if (lower.includes('competitiva') || lower.includes('proposta está')) {
          // Fase 34 - Item 110 & 112: "Essa proposta está competitiva?"
          const comps = comparableOpportunityService.findComparableOpportunities(activeOpportunity);
          const range = comparableOpportunityService.calculateMarketObservedRange(comps);
          const proposed = activeOpportunity.estimatedValue ? Math.round(activeOpportunity.estimatedValue * 0.94) : 2254000;
          const cost = Math.round(proposed * 0.79);
          const margin = Math.round(((proposed - cost) / proposed) * 100);
          const diffPct = range.median > 0 ? Math.round(((proposed - range.median) / range.median) * 100) : 0;

          structuredReply = {
            resumo: `Inteligência de Preço: Encontrei ${comps.length} contratações comparáveis no Vellia. A mediana observada foi R$ ${(range.median / 1000).toFixed(0)} mil. Sua proposta atual está em R$ ${(proposed / 1000).toFixed(0)} mil, ${Math.abs(diffPct)}% ${diffPct >= 0 ? 'acima' : 'abaixo'} da mediana. A margem projetada é ${margin}%.`,
            indicadores: [
              { label: 'Proposta Atual', value: `R$ ${(proposed / 1000).toFixed(0)}k` },
              { label: 'Mediana Mercado', value: `R$ ${(range.median / 1000).toFixed(0)}k` },
              { label: 'Margem Projetada', value: `${margin}%` },
              { label: 'Comparáveis', value: `${range.observationsCount} processos` }
            ],
            pendencias: [
              diffPct > 10 
                ? 'Recomendo revisar a composição de custos e o BDI antes da aprovação final, não necessariamente reduzir o preço.'
                : 'Proposta perfeitamente enquadrada na faixa observada do contratante.',
              'Atenção à Regra de Governança: Preço piso protegido em R$ 2.009.000,00 na Sala de Guerra.'
            ],
            recomendacao: 'Acessar a subseção "Estratégia de Preço" para simular cenários Conservador e Competitivo.',
            fontes: `Baseado em ${range.observationsCount} contratos comparáveis e resultados históricos do Vellia (FASE 34).`
          };
        } else if (lower.includes('são comparáveis') || lower.includes('contratos comparáveis') || lower.includes('quais contratos')) {
          // Fase 34 - Item 110: "Quais contratos são comparáveis?"
          const comps = comparableOpportunityService.findComparableOpportunities(activeOpportunity);
          const topComps = comps.slice(0, 3);

          structuredReply = {
            resumo: `Comparabilidade Semântica: Identificadas ${comps.length} contratações com alta e média similaridade de escopo para "${activeOpportunity.title || 'Serviços Técnicos'}".`,
            indicadores: [
              { label: 'Alta Similaridade', value: `${comps.filter(c => c.similarityTier.includes('Alta')).length}` },
              { label: 'Média Similaridade', value: `${comps.filter(c => c.similarityTier.includes('Média')).length}` },
              { label: 'Critérios', value: 'Serviço, Escopo, Região e Porte' },
              { label: 'Suficiência', value: 'Confiável' }
            ],
            pendencias: [
              `Top 1: ${topComps[0]?.client} (${topComps[0]?.object?.slice(0, 40)}...) — Preço: R$ ${(topComps[0]?.winningPrice / 1000).toFixed(0)}k`,
              topComps[1] ? `Top 2: ${topComps[1]?.client} — Preço: R$ ${(topComps[1]?.winningPrice / 1000).toFixed(0)}k` : 'Mais referências disponíveis no painel'
            ],
            recomendacao: 'Clique em "Ver Comparáveis" no painel de Estratégia de Preço para expandir os detalhes de cada escopo.',
            fontes: 'Baseado no ComparableOpportunityService (FASE 34).'
          };
        } else if (lower.includes('quanto os vencedores') || lower.includes('vencedores cobraram')) {
          // Fase 34 - Item 110: "Quanto os vencedores cobraram?"
          const comps = comparableOpportunityService.findComparableOpportunities(activeOpportunity);
          const range = comparableOpportunityService.calculateMarketObservedRange(comps);

          structuredReply = {
            resumo: `Faixa de Preços Vencedores Observados: Mínimo de R$ ${(range.min / 1000).toFixed(0)}k, Mediana de R$ ${(range.median / 1000).toFixed(0)}k e Máximo de R$ ${(range.max / 1000).toFixed(0)}k.`,
            indicadores: [
              { label: 'Menor Vencedor', value: `R$ ${(range.min / 1000).toFixed(0)}k` },
              { label: 'Mediana Central', value: `R$ ${(range.median / 1000).toFixed(0)}k` },
              { label: 'Maior Vencedor', value: `R$ ${(range.max / 1000).toFixed(0)}k` },
              { label: 'Dispersão', value: range.dispersionText }
            ],
            pendencias: [
              'Desconto Médio Praticado: Os vencedores praticaram em média 14% a 18% de desconto sobre o valor estimado do edital.',
              'Cuidado com Outliers: Valores muito discrepantes decorrem de divergências de regime de mobilização ou diárias.'
            ],
            recomendacao: 'Analisar a distribuição de dispersão na subseção "Mercado Observado".',
            fontes: 'Baseado em atas oficiais e resultados de julgamento registrados no Vellia.'
          };
        } else if (lower.includes('sacrificando margem') || (lower.includes('margem') && lower.includes('preço'))) {
          // Fase 34 - Item 110: "Estamos sacrificando margem?"
          const proposed = activeOpportunity.estimatedValue ? Math.round(activeOpportunity.estimatedValue * 0.94) : 2254000;
          const cost = Math.round(proposed * 0.79);
          const margin = Math.round(((proposed - cost) / proposed) * 100);

          structuredReply = {
            resumo: `Diagnóstico de Proteção de Margem (Margin Protection): A margem projetada atual é de ${margin}%, acima do piso mínimo institucional de 12%. Não há sacrifício indevido de rentabilidade no valor de envio.`,
            indicadores: [
              { label: 'Margem Atual', value: `${margin}%` },
              { label: 'Piso Protegido', value: '12%' },
              { label: 'Status', value: 'Margem Segura' },
              { label: 'Espaço de Redução', value: `Até R$ ${(cost * 1.12 / 1000).toFixed(0)}k` }
            ],
            pendencias: [
              'Alerta Preventivo: Qualquer lance na disputa que reduza a margem para menos de 12% exigirá autorização de Override da Diretoria.',
              'Sensibilidade: Um desconto adicional de 5% reduzirá a margem para 17%.'
            ],
            recomendacao: 'Manter a proposta inicial com margem de 21% e utilizar os degraus de disputa apenas se houver pressão de lances.',
            fontes: 'Baseado na Matriz de Custos Internos e Floor Price da Sala de Guerra.'
          };
        } else if (lower.includes('concorrente aparece mais') || (lower.includes('concorrente') && lower.includes('serviço'))) {
          // Fase 34 - Item 110: "Qual concorrente aparece mais nesse serviço?"
          const comps = comparableOpportunityService.getCompetitorPriceIntelligence(activeOpportunity.primaryService);
          const topComp = comps[0];

          structuredReply = {
            resumo: `Concorrência Mais Observada no Serviço: "${topComp.name}" é o concorrente com maior frequência observada (${topComp.observedEncounters} confrontos diretos no histórico do Vellia).`,
            indicadores: [
              { label: 'Mais Observado', value: topComp.name },
              { label: 'Confrontos', value: `${topComp.observedEncounters} certames` },
              { label: 'Nossas Vitórias', value: `${topComp.ourWins}` },
              { label: 'Vitórias Deles', value: `${topComp.theirWins}` }
            ],
            pendencias: [
              `Comportamento de Preço: ${topComp.pricePositioning}.`,
              `Faixa Típica: ${topComp.observedPriceRange}.`
            ],
            recomendacao: 'Ver o relatório Head-to-Head na subseção "Concorrentes" em Estratégia de Preço.',
            fontes: 'Baseado no Histórico de Julgamentos e Concorrentes do Vellia (FASE 34).'
          };
        } else if (lower.includes('visita') || lower.includes('técnica')) {
          structuredReply = {
            resumo: `Cláusula de Visita Técnica para o Edital #${activeOpportunity.id}: A vistoria é classificada como FACULTATIVA pelo contratante ${activeOpportunity.client || 'Petrobras'}.`,
            indicadores: [
              { label: 'Natureza', value: 'Facultativa' },
              { label: 'Alternativa', value: 'Declaração formal aceita' },
              { label: 'Responsável', value: activeOpportunity.recommendedCompany || 'Veeluen Solutions' }
            ],
            pendencias: [
              'Emitir declaração formal de pleno conhecimento das condições operacionais',
              'Assinatura digital pelo responsável técnico antes do fechamento do lote'
            ],
            recomendacao: 'Substituir vistoria presencial pela declaração padrão do Vellia.',
            fontes: 'Baseado em 3 registros do Vellia (Edital cláusula 7.2, Anexo III e Modelo de Declaração).'
          };
        } else if (lower.includes('qualificação') || lower.includes('atestado') || lower.includes('capacidade')) {
          structuredReply = {
            resumo: `Exigência de Qualificação Técnica: Comprovação de execução de no mínimo 50% dos quantitativos principais em serviços correlatos offshore.`,
            indicadores: [
              { label: 'Atestado CAT', value: 'Disponível (4892/2023)' },
              { label: 'Equipe Especializada', value: '100% Qualificada' },
              { label: 'Enquadramento', value: 'Apto' }
            ],
            pendencias: [
              'Anexar ART de desfecho do serviço executado em 2023',
              'Validar certidão de acervo técnico no CREA/RJ'
            ],
            recomendacao: 'Documentação técnica compatível com as exigências editalícias.',
            fontes: 'Baseado em 4 registros do Vellia (Acervo CREA, CAT 4892/2023, Dossiê Técnico e Edital).'
          };
        } else if (lower.includes('go') || lower.includes('decisão') || lower.includes('recomendação')) {
          const dec = DecisionService.calculateDecision(activeOpportunity);
          structuredReply = {
            resumo: `Avaliação Estratégica GO / NO-GO para #${activeOpportunity.id}: O processo apresenta elevada aderência e retorno financeiro projetado condizente com a meta.`,
            indicadores: [
              { label: 'Decisão', value: dec?.recommendationTier || 'GO COM PENDÊNCIAS' },
              { label: 'Aderência', value: `${activeOpportunity.score || 92}%` },
              { label: 'Margem Alvo', value: '24%' }
            ],
            pendencias: [
              'Aprovar planilha de custos com a controladoria',
              'Confirmar disponibilidade do responsável técnico designado'
            ],
            recomendacao: `${dec?.recommendationTier || 'GO COM PENDÊNCIAS'} — Prosseguir para fechamento de proposta comercial.`,
            fontes: 'Baseado em 5 registros do Vellia (Matriz Decisória, Score Ponderado, Simulação de Margem e Histórico).'
          };
        } else if (lower.includes('relevante') || lower.includes('por que') || lower.includes('motivo') || lower.includes('aderência')) {
          const matchAnalysis = contextualMatchingEngine.analyze({
            title: activeOpportunity.title,
            object: activeOpportunity.object,
            description: activeOpportunity.description || activeOpportunity.object,
            location: activeOpportunity.location,
            daysLeft: activeOpportunity.daysLeft,
            forcedPortal: activeOpportunity.portal
          });

          structuredReply = {
            resumo: `Justificativa Baseada em Sinais Persistidos do Vellia: ${matchAnalysis.explanationSummary}`,
            indicadores: [
              { label: 'Relevância Técnica', value: `${matchAnalysis.technicalMatchScore}%` },
              { label: 'Fit Comercial', value: `${matchAnalysis.commercialFitScore}%` },
              { label: 'Confiança', value: matchAnalysis.confidence },
              { label: 'Intenção', value: matchAnalysis.serviceIntent }
            ],
            pendencias: matchAnalysis.negativeSignals?.length > 0 ? matchAnalysis.negativeSignals : [
              'Nenhum termo impeditivo ou negativo detectado pelo motor semântico.'
            ],
            recomendacao: `Empresa indicada: ${matchAnalysis.recommendedCompany}. Serviço principal: ${matchAnalysis.primaryServiceName}.`,
            fontes: `Baseado na Análise Semântica Contextual (Motor: ${matchAnalysis.engineVersion}, Vocabulário: ${matchAnalysis.vocabularyVersion}).`
          };
        } else if (lower.includes('pront') || lower.includes('enviar') || lower.includes('falta')) {
          structuredReply = {
            resumo: `Diagnóstico de Prontidão da Sala de Guerra para #${activeOpportunity.id}: Prontidão Global estimada em 85%. Bloqueador pendente: Aprovação de preço comercial pela Diretoria.`,
            indicadores: [
              { label: 'Prontidão Global', value: '85%' },
              { label: 'Bloqueadores', value: '1 ativo (Preço)' },
              { label: 'Dossiê Técnico', value: '100% Concluído' },
              { label: 'Declarações', value: 'Assinadas' }
            ],
            pendencias: [
              'Aprovação formal do preço de venda (R$ 2.254.000) pela Diretoria',
              'Congelar snapshots imutáveis antes de cadastrar no portal'
            ],
            recomendacao: 'NÃO ENVIAR AUTOMATICAMENTE. Concluir a aprovação interna e registrar o protocolo com recibo anexado.',
            fontes: 'Baseado na Sala de Guerra (FASE 30), Dossiê de Habilitação (FASE 29) e Matriz de Riscos.'
          };
        } else if (lower.includes('atrasad') || lower.includes('quem')) {
          structuredReply = {
            resumo: `Status de Atribuições & SLA da Participação #${activeOpportunity.id}: Bid Owner: Dra. Mariana Castro. Tarefa em atenção: Aprovação comercial.`,
            indicadores: [
              { label: 'Bid Owner', value: 'Mariana Castro' },
              { label: 'Comercial', value: 'Carlos Silveira' },
              { label: 'Técnico', value: 'Dr. Roberto Albuquerque' },
              { label: 'SLA', value: 'Dentro do prazo' }
            ],
            pendencias: [
              'Carlos Silveira / Diretoria: Submeter formalização de margem no módulo de precificação'
            ],
            recomendacao: 'Notificar responsável comercial via Sala de Guerra para liberação de envio.',
            fontes: 'Baseado na Matriz RACI da Sala de Guerra da Licitação.'
          };
        } else if (lower.includes('limite') || lower.includes('piso') || lower.includes('mínimo') || lower.includes('margem')) {
          structuredReply = {
            resumo: `Diretriz Confidencial de Preço & Lances: Preço de envio estabelecido em R$ 2.254.000,00 com piso mínimo protegido de R$ 2.009.000,00.`,
            indicadores: [
              { label: 'Preço de Envio', value: 'R$ 2.254.000' },
              { label: 'Piso Confidencial', value: 'R$ 2.009.000' },
              { label: 'Margem Meta', value: '24%' },
              { label: 'Acesso', value: 'Restrito à Diretoria' }
            ],
            pendencias: [
              'Regra de Proteção: Qualquer lance abaixo do piso exige Override justificado em auditoria'
            ],
            recomendacao: 'IA não realiza lances automáticos. Respeitar o degrau de R$ 5.000 durante a disputa.',
            fontes: 'Baseado na Estratégia Comercial da Sala de Guerra e Políticas de Governança.'
          };
        } else if (lower.includes('sessão') || lower.includes('disputa') || lower.includes('lance')) {
          structuredReply = {
            resumo: `Sessão Pública de Disputa agendada no portal ${activeOpportunity.portal || 'Petronect Público'} para 25/10/2026 às 10:00 (${activeOpportunity.officialTimezone || 'Horário Oficial de Brasília'}).`,
            indicadores: [
              { label: 'Data', value: '25/10/2026' },
              { label: 'Horário', value: '10:00' },
              { label: 'Operador', value: 'Mariana Castro' },
              { label: 'Modo Live', value: 'Manual' }
            ],
            pendencias: [
              'Confirmar credenciais do portal 30 minutos antes da abertura',
              'Abrir o Live Session Workspace para acompanhamento em modo compacto'
            ],
            recomendacao: 'Sincronizar evento com o Google Calendar / Outlook corporativo.',
            fontes: 'Baseado na Agenda Oficial e Sessão Pública da Sala de Guerra.'
          };
        } else if (lower.includes('diligência') || lower.includes('recurso') || lower.includes('esclarecimento')) {
          structuredReply = {
            resumo: `Status de Diligências e Questionamentos: 1 Pedido de Esclarecimento já respondido pelo pregoeiro confirmando a NBR 9898. Nenhuma diligência de saneamento aberta no momento.`,
            indicadores: [
              { label: 'Diligências Ativas', value: '0 pendentes' },
              { label: 'Esclarecimentos', value: '1 atendido' },
              { label: 'Prazo Restante', value: 'Sob controle' }
            ],
            pendencias: [
              'Em caso de nova diligência, gerar Supplemental Package sem sobrescrever o Dossiê original'
            ],
            recomendacao: 'Manter monitoramento ativo do chat oficial do portal durante a sessão.',
            fontes: 'Baseado no Módulo de Diligências e Saneamento da Sala de Guerra.'
          };
        } else if (lower.includes('contrato') || lower.includes('obrigação') || lower.includes('renova')) {
          structuredReply = {
            resumo: `Gestão Pós-Vitória & Contratos (FASE 31): Contrato vinculado nº 4600612980/2026 com Petrobras RNEST. Vigência até 31/10/2027 (R$ 2.254.000,00).`,
            indicadores: [
              { label: 'Status', value: 'Em vigência' },
              { label: 'Saúde', value: 'Saudável' },
              { label: 'Vencimento', value: '31/10/2027' },
              { label: 'Renovação', value: 'Possível (PCA)' }
            ],
            pendencias: [
              'Obrigação estratégica: Emissão de laudo mensal de conformidade de efluentes até dia 05',
              'Acompanhar publicação do PCA para antecipação do próximo certame'
            ],
            recomendacao: 'Manter excelência na execução para pontuação máxima e alinhamento com a fiscalização.',
            fontes: 'Baseado no Módulo de Contratos (FASE 31), Handoff Package e Radar de Renovação.'
          };
        } else {
          structuredReply = {
            resumo: `Processando análise da oportunidade #${activeOpportunity.id} com base no banco de inteligência do Vellia Licitações.`,
            indicadores: [
              { label: 'Status Cadastral', value: 'Regular' },
              { label: 'Portal', value: activeOpportunity.portal || 'Petronect' },
              { label: 'Risco Jurídico', value: 'Baixo' }
            ],
            pendencias: [
              'Conferir minuta final no portal antes da data-limite'
            ],
            recomendacao: 'Manter proposta na esteira de elaboração prioritária.',
            fontes: 'Baseado em 3 registros do Vellia (Registro Petronect, Histórico Corporativo e Matriz de Riscos).'
          };
        }
      } else {
        if (lower.includes('por que essa tarefa foi criada') || lower.includes('tarefa foi criada')) {
          // Fase 37 - Item 140
          structuredReply = {
            resumo: `Rastreabilidade de Ação Automatizada: A tarefa de renovação foi criada automaticamente pelo workflow "WF-04" porque a certidão corporativa (CND Federal) possui validade inferior a 30 dias e atende a 2 propostas ativas da empresa.`,
            indicadores: [
              { label: 'Origem', value: 'Workflow WF-04' },
              { label: 'Trigger', value: 'DOCUMENT_EXPIRING' },
              { label: 'Prioridade', value: 'Crítica' },
              { label: 'Modo', value: 'AUTO (Interno Seguro)' }
            ],
            pendencias: [
              'Concluir o pedido de certidão na Receita Federal antes do encerramento do prazo.'
            ],
            recomendacao: 'Acessar o módulo de Documentos ou a Central de Automações para conferir o status.',
            fontes: 'WorkflowEngine e EventBus do Vellia (FASE 37).'
          };
        } else if (lower.includes('qual automação gerou') || lower.includes('gerou este alerta')) {
          // Fase 37 - Item 140
          structuredReply = {
            resumo: `Diagnóstico de Automação: O alerta foi gerado pelo workflow "WF-11 — Alerta Crítico de Proposta em Risco de Deadline" devido à proximidade da sessão pública com propostas ainda em fase de elaboração.`,
            indicadores: [
              { label: 'Workflow', value: 'WF-11' },
              { label: 'Criticidade', value: 'Alerta Vermelho' },
              { label: 'Alvo', value: 'Command Center & Gestão' }
            ],
            pendencias: [
              'Verificar se as propostas prioritárias já foram protocoladas no portal do contratante.'
            ],
            recomendacao: 'Acessar a Central de Automações no menu lateral para visualizar os logs da esteira.',
            fontes: 'EventBus e WorkflowEngine (FASE 37).'
          };
        } else if (lower.includes('esperando minha aprovação') || lower.includes('minhas aprovações') || lower.includes('o que está esperando')) {
          // Fase 36 - Itens 77 a 79: "O que está esperando minha aprovação?"
          const list = approvalService.listAllApprovals();
          const pending = list.filter(r => r.status === ApprovalStatus.PENDING);

          structuredReply = {
            resumo: `Fila de Deliberações Pendentes: Existem ${pending.length} solicitações aguardando sua análise na Central de Governança. ATENÇÃO: O Copilot NÃO aprova deliberações automaticamente — a decisão humana e o sign-off digital são mandatórios por governança (Itens 78 e 79).`,
            indicadores: [
              { label: 'Pendências Críticas', value: `${pending.filter(p => p.priority === 'CRITICA').length}` },
              { label: 'Total na Fila', value: `${pending.length} pedidos` },
              { label: 'SLA mais Próximo', value: '2 horas' },
              { label: 'Segregação', value: 'Ativa (Sem auto-aprovação)' }
            ],
            pendencias: pending.slice(0, 2).map(p => `#${p.id}: ${p.opportunityTitle} (${p.organ}) — R$ ${(p.amount / 1000).toFixed(0)}k [${p.priority}]`),
            recomendacao: 'Acessar a "Central de Governança & Alçadas" no menu lateral para aprovar, rejeitar ou solicitar ajustes.',
            fontes: 'Baseado na Fila de Pendências do ApprovalService (FASE 36).'
          };
        } else if (lower.includes('mais esforço') || lower.includes('exige mais esforço')) {
          // Fase 35 - Item 91: "Qual proposta exige mais esforço?"
          structuredReply = {
            resumo: `Mapeamento de Carga de Equipe & Esforço Interno: A proposta "Modernização Datacenter TJRJ" exige o maior esforço global (Crítico em Documentação e Alto em Engenharia), demandando 8 declarações específicas, ART com acervo e memorial metodológico completo.`,
            indicadores: [
              { label: 'Maior Esforço', value: 'Modernização TJRJ' },
              { label: 'Carga Documental', value: 'Crítica (1 pendência)' },
              { label: 'Carga Engenharia', value: 'Alta (Metodologia)' },
              { label: 'SLA Entrega', value: '3 dias' }
            ],
            pendencias: [
              'Conflito de Recursos: O engenheiro sênior está alocado simultaneamente na proposta PRODERJ e TJRJ.',
              'Revisão Necessária: Rebalancear prazos no Planejamento de Capacidade Semanal.'
            ],
            recomendacao: 'Abrir o Simulador de Cenários > Fila de Decisões para visualizar o mapa de sobrecarga de responsáveis.',
            fontes: 'Baseado no Resource Load Estimator e Capacity Planning da Fase 35.'
          };
        } else if (lower.includes('priorizar') || lower.includes('quais oportunidades')) {
          // Fase 35 - Itens 51 a 60 & 91: "Quais oportunidades devemos priorizar?"
          const queue = strategicSimulationService.getDecisionQueue();
          const topPri = queue[0];

          structuredReply = {
            resumo: `Priorização de Portfólio (Trade-offs de Capacidade): Com base nos prazos, retorno e carga interna, a prioridade máxima desta semana é "${topPri?.title || 'Modernização TJRJ'}" (Vence em ${topPri?.slaDeadline || '2 dias'}), seguida pela Infraestrutura PRODERJ.`,
            indicadores: [
              { label: 'Top 1 Prioritária', value: topPri?.organ || 'TJRJ' },
              { label: 'Valor em Jogo', value: `R$ ${(topPri?.refValue / 1000).toFixed(0)}k` },
              { label: 'Urgência SLA', value: topPri?.slaUrgency?.toUpperCase() || 'ALTA' },
              { label: 'Decisões na Fila', value: `${queue.length} pendentes` }
            ],
            pendencias: [
              'Alerta de Deadline: O edital do TJRJ exige decisão de Go/No-Go e definição de cenário até às 17h de hoje.',
              'Capacidade Disponível: Evitar abrir mais de 3 frentes técnicas com o mesmo especialista.'
            ],
            recomendacao: 'Acessar o "Simulador de Cenários" para comparar trade-offs lado a lado antes de empenhar horas da equipe.',
            fontes: 'Baseado na Fila de Decisões e Matriz de Portfólio da Fase 35.'
          };
        } else if (lower.includes('contrato') || lower.includes('venc') || lower.includes('renova') || lower.includes('mês') || lower.includes('meses')) {
          structuredReply = {
            resumo: `Panorama de Contratos Conquistados (FASE 31): 2 contratos ativos somando R$ 3.854.000,00. 1 contrato com término próximo (<90 dias) gerando sinal de renovação.`,
            indicadores: [
              { label: 'Contratos Ativos', value: '2' },
              { label: 'Valor Total', value: 'R$ 3.85M' },
              { label: 'Vencendo em <90d', value: '1 (COMPESA)' },
              { label: 'Sinais em Radar', value: '2 em watch' }
            ],
            pendencias: [
              'COMPESA 104/2025 vence em 47 dias: preparar atestados e monitorar novo certame no Portal PE',
              'Petrobras RNEST: entrega do laudo mensal acreditado pelo Inmetro'
            ],
            recomendacao: 'Acessar o Módulo Contratos > Inteligência de Renovação para visualizar as ações antecipadas.',
            fontes: 'Baseado no Módulo de Contratos (FASE 31) e Radar Antecipado (FASE 16).'
          };
        } else if (lower.includes('fazer hoje') || lower.includes('o que devemos fazer') || lower.includes('foco de hoje')) {
          // Fase 33 - Item 87: "O que devemos fazer hoje?"
          const focus = nextBestActionService.getDailyFocus();
          const topAct = focus.criticalActions[0];

          structuredReply = {
            resumo: `Plano Operacional de Hoje (${focus.date}): ${focus.totalActions} ações sugeridas pelo motor prescritivo, com foco prioritário em "${topAct?.actionTitle || 'Retomada de relacionamento com a COMPESA'}".`,
            indicadores: [
              { label: 'Ações Prioritárias', value: `${focus.criticalActions.length}` },
              { label: 'Follow-ups CRM', value: `${focus.pendingFollowUpsCount} pendentes` },
              { label: 'Reuniões Agendadas', value: `${focus.scheduledMeetingsCount}` },
              { label: 'Gaps de Contato', value: `${focus.uncontactedStrategicAccountsCount} contas` }
            ],
            pendencias: [
              topAct ? `Prioridade Máxima: ${topAct.actionDescription} (Prazo: ${topAct.dueDate})` : 'Conferir propostas em elaboração com vencimento em 48h',
              'Sincronizar tarefas aceitas no módulo de Ações Estratégicas'
            ],
            recomendacao: 'Acessar a subseção "Hoje (Foco Diário)" no Módulo de Ações Estratégicas para aceitar ou delegar as tarefas.',
            fontes: 'Baseado no Next Best Action Engine (FASE 33), CRM Corporativo e Contratos.'
          };
        } else if (lower.includes('contatar esta semana') || lower.includes('quem devo contatar')) {
          // Fase 33 - Item 87: "Quem devo contatar esta semana?"
          const plan = nextBestActionService.getWeeklyCommercialPlan();
          const leadAccount = plan.top5Accounts[0];

          structuredReply = {
            resumo: `Planejamento Comercial da Semana: Recomenda-se contatar prioritariamente ${plan.top5Accounts.map(a => a.name).join(', ')}. Principal destaque para ${leadAccount?.name || 'COMPESA'}.`,
            indicadores: [
              { label: 'Conta Líder', value: leadAccount?.name || 'COMPESA' },
              { label: 'Serviço em Foco', value: leadAccount?.targetService || 'Operação de ETE' },
              { label: 'Top Contas', value: `${plan.top5Accounts.length} selecionadas` },
              { label: 'Ações Recomendadas', value: `${plan.top5Actions.length} cadastradas` }
            ],
            pendencias: [
              `Justificativa: Contrato prestes a vencer em 47 dias e histórico de abertura de certame no mesmo trimestre.`,
              'Ação Humana: Abrir o Briefing Pré-Reunião antes de disparar qualquer abordagem comercial.'
            ],
            recomendacao: 'Utilizar a subseção "Esta Semana" em Ações Estratégicas para registrar os contatos e follow-ups.',
            fontes: 'Baseado no Plano Comercial Semanal da Fase 33 e no Radar de Renovação da Fase 31.'
          };
        } else if (lower.includes('sem relacionamento') || lower.includes('gap')) {
          // Fase 33 - Item 87: "Quais contas estão sem relacionamento?"
          const recs = nextBestActionService.generateRecommendations();
          const uncontacted = recs.filter(r => !r.hasContact || r.whyNow?.includes('Sem nenhuma interação'));
          const names = uncontacted.slice(0, 3).map(u => u.organization).join(', ') || 'Universidade Federal / Suape';

          structuredReply = {
            resumo: `Auditoria de Relacionamento (Relationship Gap): Foram identificadas contas estratégicas sem interação há mais de 30 dias ou sem interlocutor cadastrado: ${names}.`,
            indicadores: [
              { label: 'Contas em Gap', value: `${uncontacted.length} mapeadas` },
              { label: 'Sem Contato Cadastrado', value: `${uncontacted.filter(u => !u.hasContact).length}` },
              { label: 'Política Aplicada', value: '30d Estratégica / 90d Monitorada' },
              { label: 'Risco', value: 'Perda de timing de contratação' }
            ],
            pendencias: [
              'Regra de Proteção: O sistema NÃO recomenda enviar e-mail sem interlocutor conhecido.',
              'Primeira Ação Obrigatória: Mapear o responsável técnico ou da comissão de licitações no órgão.'
            ],
            recomendacao: 'Acessar a subseção "Relacionamentos & Gaps" para atribuir responsáveis comerciais para mapeamento.',
            fontes: 'Baseado no CRM Corporativo, Timeline de Interações e Motor Prescritivo (FASE 33).'
          };
        } else if (lower.includes('merece mais atenção') || lower.includes('mais atenção agora')) {
          // Fase 33 - Item 87: "Qual organização merece mais atenção agora?"
          const recs = nextBestActionService.generateRecommendations();
          const critical = recs.find(r => r.priority === ActionPriority.CRITICA) || recs[0];

          structuredReply = {
            resumo: `Conta de Máxima Atenção Imediata: "${critical?.organization || 'COMPESA'}" merece atenção imediata prioritária.`,
            indicadores: [
              { label: 'Organização', value: critical?.organization || 'COMPESA' },
              { label: 'Prioridade', value: critical?.priority || 'CRÍTICA' },
              { label: 'Empresa do Grupo', value: critical?.company || 'Veeluen Solutions' },
              { label: 'Prazo Sugerido', value: critical?.dueDate || 'Próximos 3 dias' }
            ],
            pendencias: [
              `Por que agora? ${critical?.whyNow || 'Contrato atual vence em menos de 60 dias e há processos recorrentes previstos.'}`,
              'Ação Prática: Acionar a ação sugerida no painel ou gerar o Meeting Brief para alinhamento com a diretoria.'
            ],
            recomendacao: critical?.actionDescription || 'Iniciar contato com os gestores para apresentação de cases de operação.',
            fontes: 'Baseado no Next Best Action Service (FASE 33), Contratos Conquistados e Histórico de Compras.'
          };
        } else if (lower.includes('quem mais compra') || (lower.includes('compra') && lower.includes('ete'))) {
          // Item 106: "Quem mais compra ETE?"
          const mkt = marketIntelligenceService.generateMarketIntelligence({ period: '24 meses' });
          const eteService = mkt.serviceIntelligence.find(s => s.service.toLowerCase().includes('ete')) || mkt.serviceIntelligence[0];
          const topBuyer = mkt.buyerProfiles.find(b => b.servicesPurchased.some(s => s.toLowerCase().includes('ete'))) || mkt.buyerProfiles[0];
          
          structuredReply = {
            resumo: `Inteligência de Mercado: O principal comprador observado para ETE é a ${topBuyer?.name || 'COMPESA'}, acumulando ${topBuyer?.totalOpportunities || 4} contratações mapeadas nos últimos 24 meses.`,
            indicadores: [
              { label: 'Maior Comprador', value: topBuyer?.name || 'COMPESA' },
              { label: 'Ticket Médio ETE', value: `R$ ${(eteService?.averageTicket / 1000).toFixed(0)}k` },
              { label: 'Recorrência', value: topBuyer?.recurrencePattern?.confidence || 'Alta' },
              { label: 'Janela Provável', value: topBuyer?.nextExpectedWindow || 'Q1' }
            ],
            pendencias: [
              `Justificativa Estruturada: Foram observadas ${topBuyer?.totalOpportunities || 4} contratações compatíveis nos últimos 24 meses com regularidade observada.`,
              'Ação Comercial: Cadastrar follow-up antecipado na Target Account List no CRM.'
            ],
            recomendacao: `Priorizar relacionamento com ${topBuyer?.name}. Abrir perfil completo no Módulo de Mercado.`,
            fontes: 'Baseado no Módulo de Mercado (FASE 32), Histórico de Contratações e Oportunidades do Vellia.'
          };
        } else if (lower.includes('emissões') && (lower.includes('ano') || lower.includes('todos') || lower.includes('recorr'))) {
          // Item 106: "Quais órgãos compram emissões todos os anos?"
          const mkt = marketIntelligenceService.generateMarketIntelligence({ companyScope: 'Excelência Ambiental', period: '24 meses' });
          const recurrent = mkt.buyerProfiles.filter(b => b.servicesPurchased.some(s => s.toLowerCase().includes('emiss')) && b.recurrencePattern.confidence !== 'Dados Insuficientes');
          const buyerNames = recurrent.map(b => b.name).join(', ') || 'Petrobras (Refinarias e Terminais)';

          structuredReply = {
            resumo: `Recorrência Anual em Emissões Atmosféricas: Compradores com padrão anual recorrente identificado: ${buyerNames}.`,
            indicadores: [
              { label: 'Padrão Observado', value: 'Anual (~12 meses)' },
              { label: 'Confiança', value: 'Alta / Média' },
              { label: 'Empresa do Grupo', value: 'Excelência Ambiental' },
              { label: 'Sinais Futuros', value: `${mkt.futureSignals.length} mapeados` }
            ],
            pendencias: [
              'Justificativa: Compras sucessivas em intervalos de 10 a 14 meses detectadas na timeline do Vellia.',
              'Alerta de Radar: Início de prospecção deve ocorrer 90 dias antes da janela histórica.'
            ],
            recomendacao: 'Ativar monitoramento preventivo na Central de Inteligência de Mercado.',
            fontes: 'Baseado na Timeline de Compras e Detector de Periodicidade (FASE 32).'
          };
        } else if (lower.includes('estados') || (lower.includes('onde') && lower.includes('oportunidades'))) {
          // Item 106: "Em quais estados temos mais oportunidades?"
          const mkt = marketIntelligenceService.generateMarketIntelligence({ period: '12 meses' });
          const topGeos = mkt.geographicData.slice(0, 3);
          const leader = topGeos[0];

          structuredReply = {
            resumo: `Densidade Geográfica de Oportunidades: O estado com maior volume é ${leader?.state || 'Pernambuco'} (${leader?.opportunityCount || 12} processos mapeados, totalizando R$ ${(leader?.totalValueMapped / 1000000).toFixed(1)}M), seguido por ${topGeos[1]?.state || 'RJ'} e ${topGeos[2]?.state || 'SP'}.`,
            indicadores: [
              { label: 'Líder em Volume', value: leader?.state || 'PE' },
              { label: 'Oportunidades', value: `${leader?.opportunityCount || 12} processos` },
              { label: 'Compradores no UF', value: `${leader?.buyersCount || 5} órgãos` },
              { label: 'Densidade', value: 'Alta Densidade' }
            ],
            pendencias: [
              `Justificativa: Concentração de demandas em ${leader?.topServices?.slice(0, 2).join(' e ') || 'saneamento e indústria'}.`,
              'Espaço de Mercado: Regiões com alta demanda e baixa participação interna foram sinalizadas como Whitespace.'
            ],
            recomendacao: 'Utilizar o Mapa Estratégico de Compradores no Módulo de Mercado para filtrar por UF.',
            fontes: 'Baseado no Mapa de Compradores e Agrupamento Geográfico (FASE 32).'
          };
        } else if (lower.includes('prospectar') || lower.includes('contas prioritárias') || lower.includes('clientes devemos')) {
          // Item 106: "Quais clientes devemos prospectar agora?"
          const mkt = marketIntelligenceService.generateMarketIntelligence({ period: '12 meses' });
          const target = mkt.targetAccounts[0] || { organization: 'COMPESA', relatedServices: ['Tratamento de Efluentes'], nextSignal: 'Janela Q1' };

          structuredReply = {
            resumo: `Target Account Prioritária: Recomenda-se priorizar a organização "${target.organization}" porque foram observadas contratações regulares compatíveis com nosso portfólio e o próximo sinal de compra aponta para ${target.nextSignal}.`,
            indicadores: [
              { label: 'Organização Alvo', value: target.organization },
              { label: 'Classificação', value: target.priority || 'Estratégico' },
              { label: 'Serviços Foco', value: target.relatedServices?.slice(0, 2).join(', ') },
              { label: 'Próxima Janela', value: target.nextSignal }
            ],
            pendencias: [
              `Justificativa Estruturada: Volume histórico relevante de R$ ${(target.historicalValue / 1000).toFixed(0)}k e fit técnico confirmado.`,
              'Ação Prática: Acionar botão "Follow-up CRM" na aba de Tendências & Whitespaces.'
            ],
            recomendacao: target.nextAction || 'Iniciar prospecção técnica antecipada.',
            fontes: 'Baseado na Target Account List e Matriz de Priorização Comercial (FASE 32).'
          };
        } else if (lower.includes('concorrente') || lower.includes('head-to-head')) {
          // Item 106: "Quem são nossos concorrentes mais frequentes?"
          const mkt = marketIntelligenceService.generateMarketIntelligence({ period: '12 meses' });
          const topComp = mkt.competitorIntelligence[0] || { name: 'Enfil S/A', headToHeadEncounters: 8, ourWins: 3, theirWins: 5 };

          structuredReply = {
            resumo: `Concorrência Observada (Head-to-Head): O concorrente que mais se confronta conosco é "${topComp.name}", com ${topComp.headToHeadEncounters} disputas diretas observadas (${topComp.ourWins} vitórias nossas vs ${topComp.theirWins} vitórias deles).`,
            indicadores: [
              { label: 'Mais Frequente', value: topComp.name },
              { label: 'Confrontos', value: `${topComp.headToHeadEncounters} certames` },
              { label: 'Nossas Vitórias', value: `${topComp.ourWins}` },
              { label: 'Faixa de Preço', value: topComp.priceRangeObserved || 'Competitiva' }
            ],
            pendencias: [
              'Importante: Métricas baseadas exclusivamente em resultados observados no Vellia (sem extrapolação irrestrita de market share).',
              'Análise de Preço: Manter rigor na formação de custos e inteligência de lances na Sala de Guerra.'
            ],
            recomendacao: 'Acessar a subseção "Concorrência Observada" no Módulo de Mercado para comparativo de preços.',
            fontes: 'Baseado no Histórico de Disputas e Resultados de Licitações (FASE 32 & 28).'
          };
        } else if (lower.includes('contratos vencem') || (lower.includes('vencem') && lower.includes('6 meses'))) {
          // Item 107: "Quais contratos vencem nos próximos 6 meses e podem gerar nova contratação?"
          const mkt = marketIntelligenceService.generateMarketIntelligence({ period: '12 meses' });
          const signals = mkt.futureSignals.filter(s => s.source.toLowerCase().includes('contrato') || s.source.toLowerCase().includes('pca'));

          structuredReply = {
            resumo: `Contratos Prestes a Vencer & Sinais Futuros: Foram identificados ${signals.length} sinais futuros de recontratação nos próximos 6 meses, incluindo COMPESA e Petrobras.`,
            indicadores: [
              { label: 'Sinais Mapeados', value: `${signals.length} contratos/PCA` },
              { label: 'Status', value: 'Observed / Planned' },
              { label: 'Janela Crítica', value: 'Próximos 180 dias' },
              { label: 'Ação Comercial', value: 'Prospecção Preventiva' }
            ],
            pendencias: [
              'Contrato COMPESA ETE Caruaru vence em 47 dias: recontratação iminente no Portal PE.',
              'Contrato Petrobras RNEST: janela de renovação ou novo edital estimada para Q1.'
            ],
            recomendacao: 'Alimentar o Radar Antecipado e acionar os gestores de conta para agendamento de reuniões técnicas.',
            fontes: 'Baseado no Handoff de Contratos (FASE 31), Radar Antecipado e PCA Integrado.'
          };
        } else if (lower.includes('cliente') || lower.includes('histórico') || lower.includes('organiza')) {
          structuredReply = {
            resumo: `Account Intelligence (Organization 360): O cliente com maior volume histórico de contratação é a Petrobras (R$ 8.2M transacionados em oportunidades e contratos vigentes), seguido pela COMPESA.`,
            indicadores: [
              { label: 'Maior Cliente', value: 'Petrobras' },
              { label: 'Taxa de Retenção', value: '80%' },
              { label: 'Contratos Vigentes', value: '1 ativo' },
              { label: 'Cross-Sell', value: '2 serviços' }
            ],
            pendencias: [
              'Avaliar oportunidade interna de cross-sell em inspeção NR-13 para a Petrobras RNEST'
            ],
            recomendacao: 'Fortalecer relacionamento com fiscais e gestores mapeados no CRM.',
            fontes: 'Baseado no CRM Corporativo (FASE 17) e Contratos Conquistados (FASE 31).'
          };
        } else if (lower.includes('prazo') || lower.includes('vencem') || lower.includes('dias')) {
          structuredReply = {
            resumo: `Prazos Críticos na Operação: 3 oportunidades com submissão prevista nos próximos dias exigem conferência de dossiers.`,
            indicadores: [
              { label: 'Hoje / 24h', value: '1 edital' },
              { label: '3 a 5 dias', value: '2 editais' },
              { label: 'Valor Total', value: 'R$ 4.93M' }
            ],
            pendencias: [
              'Concluir precificação de Petrobras Bacia de Santos (vence em 3 dias)',
              'Emitir termo de garantia para Monitoramento Búzios'
            ],
            recomendacao: 'Concentrar esforço da equipe nas oportunidades de ciclo curto.',
            fontes: 'Baseado em 6 registros do Vellia (Radar Diário, Esteira de Propostas e Cronograma Integrado).'
          };
        } else if (lower.includes('certid') || lower.includes('document')) {
          structuredReply = {
            resumo: `Centro de Capacidade & Certidões: A maior parte do acervo documental está em dia, com 1 alerta preventivo de renovação.`,
            indicadores: [
              { label: 'Certidões Válidas', value: '18 de 19' },
              { label: 'Em Renovação', value: '1 (CND Federal)' },
              { label: 'Bloqueadores', value: 'Nenhum impeditivo' }
            ],
            pendencias: [
              'Acompanhar emissão da CND Federal da Veeluen Solutions (vence em 5 dias)'
            ],
            recomendacao: 'Renovação automatizada em andamento sem risco de desclassificação.',
            fontes: 'Baseado em 4 registros do Vellia (Vault Documental, Robô de Certidões e Logs de Validade).'
          };
        } else {
          structuredReply = {
            resumo: `Consulta processada pelo motor de inteligência do Vellia. Rastreando editais, aderências e pipeline corporativo em tempo real.`,
            indicadores: [
              { label: 'Editais Mapeados', value: '14' },
              { label: 'Aderência Média', value: '88%' },
              { label: 'Taxa de Sucesso Histórica', value: '41%' }
            ],
            pendencias: [
              'Manter monitoramento de esclarecimentos no portal Petronect'
            ],
            recomendacao: 'Acessar o módulo Oportunidades para triagem individualizada.',
            fontes: 'Baseado em 4 registros do Vellia.'
          };
        }
      }

      setMessages(prev => [...prev, { 
        sender: 'bot', 
        structured: structuredReply 
      }]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 10, 20, 0.82)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '780px',
        backgroundColor: 'var(--surface-card, #0F172A)',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-elevation, 0 24px 48px rgba(0, 0, 0, 0.5))',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '88vh',
        overflow: 'hidden'
      }}>
        {/* Header do Copilot (Quiet Intelligence) */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--surface-app, #0A0F1D)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(2, 132, 199, 0.15)',
              border: '1px solid rgba(2, 132, 199, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38BDF8'
            }}>
              <Bot size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#F8FAFC', fontWeight: 700 }}>
                  Perguntar ao Vellia
                </h3>
                <span style={{
                  fontSize: '11px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#94A3B8',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 600
                }}>
                  Quiet Intelligence
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                {activeOpportunity 
                  ? `Contexto: ${activeOpportunity.client || 'Petrobras'} • Edital #${activeOpportunity.id}` 
                  : `Contexto Operacional: Módulo ${currentModule}`}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Zona Central Ampla de Mensagens */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          minHeight: '320px',
          maxHeight: '520px',
          background: 'var(--surface-app, #0A0F1D)'
        }}>
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: m.sender === 'user' ? '80%' : '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                width: m.sender === 'bot' ? '100%' : 'auto'
              }}
            >
              {m.sender === 'user' ? (
                <div style={{
                  background: 'var(--color-brand-primary, #0284C7)',
                  color: '#FFFFFF',
                  padding: '12px 18px',
                  borderRadius: '14px 14px 2px 14px',
                  fontSize: '13.5px',
                  lineHeight: 1.5,
                  fontWeight: 500
                }}>
                  {m.text}
                </div>
              ) : (
                /* RESPOSTA ESTRUTURADA (FASE 25: ITENS 62-64) */
                <div style={{
                  background: 'var(--surface-card, #0F172A)',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: 'var(--shadow-subtle, 0 4px 12px rgba(0, 0, 0, 0.2))'
                }}>
                  {/* Resumo */}
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Resumo Executivo
                    </span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: '#E2E8F0', lineHeight: 1.55 }}>
                      {m.structured?.resumo || m.text}
                    </p>
                  </div>

                  {/* Indicadores Tabulares */}
                  {m.structured?.indicadores && (
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Indicadores Chave
                      </span>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: '10px',
                        marginTop: '6px'
                      }}>
                        {m.structured.indicadores.map((ind, iIdx) => (
                          <div key={iIdx} style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '8px',
                            padding: '8px 12px'
                          }}>
                            <div style={{ fontSize: '11px', color: '#94A3B8' }}>{ind.label}</div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', fontVariantNumeric: 'tabular-nums' }}>
                              {ind.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pendências */}
                  {m.structured?.pendencias && m.structured.pendencias.length > 0 && (
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Pendências Identificadas
                      </span>
                      <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', fontSize: '13px', color: '#CBD5E1', lineHeight: 1.5 }}>
                        {m.structured.pendencias.map((pend, pIdx) => (
                          <li key={pIdx} style={{ marginBottom: '4px' }}>{pend}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recomendação */}
                  {m.structured?.recomendacao && (
                    <div style={{
                      padding: '10px 14px',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Recomendação Vellia
                      </span>
                      <strong style={{ fontSize: '13px', color: '#F8FAFC', fontWeight: 600 }}>
                        {m.structured.recomendacao}
                      </strong>
                    </div>
                  )}

                  {/* Ação Direta Contextual (Fase 26: Itens 110 e 111) */}
                  {activeOpportunity && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                      <button
                        onClick={() => {
                          if (onSelectOpportunity) onSelectOpportunity(activeOpportunity);
                          onClose();
                        }}
                        style={{
                          background: 'rgba(2, 132, 199, 0.12)',
                          border: '1px solid rgba(2, 132, 199, 0.3)',
                          color: '#38BDF8',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>Abrir Oportunidade #{activeOpportunity.id}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  )}

                  {/* Fontes Discretas (Item 64) */}
                  {m.structured?.fontes && (
                    <div style={{
                      paddingTop: '8px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      fontSize: '11px',
                      color: '#64748B',
                      fontStyle: 'italic'
                    }}>
                      {m.structured.fontes}
                    </div>
                  )}
                </div>
              )}

              {/* Prompts Sugeridos */}
              {m.suggestions && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                  {m.suggestions.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSend(sug)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.09)',
                        color: '#94A3B8',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(2, 132, 199, 0.12)';
                        e.currentTarget.style.color = '#38BDF8';
                        e.currentTarget.style.borderColor = 'rgba(2, 132, 199, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                        e.currentTarget.style.color = '#94A3B8';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
                      }}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div style={{
              alignSelf: 'flex-start',
              background: 'var(--surface-card, #0F172A)',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#94A3B8',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Sparkles size={14} color="#38BDF8" />
              <span>Analisando base do Vellia...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Rodapé com Input e Ação Direta */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          background: 'var(--surface-card, #0F172A)',
          display: 'flex',
          gap: '12px'
        }}>
          <input
            type="text"
            placeholder="Perguntar sobre cláusulas, certidões, prazos ou concorrentes..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            style={{
              flex: 1,
              backgroundColor: 'var(--surface-input, #1E293B)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#F8FAFC',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13.5px',
              outline: 'none'
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim()}
            style={{
              backgroundColor: inputValue.trim() ? 'var(--color-brand-primary, #0284C7)' : 'rgba(255, 255, 255, 0.08)',
              color: inputValue.trim() ? '#FFFFFF' : '#64748B',
              border: 'none',
              borderRadius: '8px',
              padding: '0 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: inputValue.trim() ? 'pointer' : 'default',
              fontWeight: 600,
              fontSize: '13px'
            }}
          >
            <span>Consultar</span>
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
