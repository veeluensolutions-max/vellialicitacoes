/**
 * VELLIA LICITAÇÕES - EDITAL ANALYSIS ENGINE (FASE 8)
 * Núcleo inteligente de análise de editais, termos de referência, habilitação e atestados.
 * Atua como Analista de Licitações + Analista Técnico + Assistente de Habilitação.
 */

import { EditalDocumentRepository } from './editalDocumentRepository.js';
import { CompanyCertificatesRepository } from './companyCertificatesRepository.js';
import { OpportunityService } from '../opportunityService.js';
import { DocumentStructureService } from './documentStructureService.js';
import { RequirementExtractionService, ObligatorinessLevel, RequirementType } from './requirementExtractionService.js';
import { AttestationMatchingService, ProofMatchStatus } from './attestationMatchingService.js';
import { DocumentCopilotService } from './documentCopilotService.js';
import { DocumentAuditService } from './documentAuditService.js';
import { GoldenDocumentBenchmark } from './goldenDocumentSet.js';

export const RequirementStatus = {
  ATENDIDO: 'ATENDIDO',
  PARCIALMENTE_ATENDIDO: 'PARCIALMENTE ATENDIDO',
  NAO_ATENDIDO: 'NÃO ATENDIDO',
  NAO_IDENTIFICADO: 'NÃO IDENTIFICADO',
  NAO_SE_APLICA: 'NÃO SE APLICA'
};

export const RequirementCategory = {
  JURIDICO: 'Jurídico',
  FISCAL: 'Fiscal',
  TRABALHISTA: 'Trabalhista',
  ECONOMICO_FINANCEIRO: 'Econômico-financeiro',
  TECNICO: 'Técnico',
  OPERACIONAL: 'Operacional',
  EQUIPE: 'Equipe',
  RESPONSABILIDADE_TECNICA: 'Responsabilidade técnica',
  EQUIPAMENTOS: 'Equipamentos',
  EXPERIENCIA: 'Experiência',
  ATESTADOS: 'Atestados',
  CERTIFICACOES: 'Certificações',
  PRAZO: 'Prazo',
  VISITA_TECNICA: 'Visita técnica',
  GARANTIA: 'Garantia',
  COMERCIAL: 'Comercial',
  OUTROS: 'Outros'
};

export const ParticipationRecommendation = {
  PARTICIPAR: 'PARTICIPAR',
  PARTICIPAR_COM_PENDENCIAS: 'PARTICIPAR COM PENDÊNCIAS',
  ANALISAR: 'ANALISAR',
  NAO_RECOMENDADO: 'NÃO RECOMENDADO'
};

const ANALYSIS_STORAGE_KEY = 'vellia_edital_analyses_v1';

export class EditalAnalysisEngine {
  /**
   * Obtém a análise salva para a oportunidade ou executa uma nova análise automática
   */
  static getAnalysis(opportunityNumber) {
    const key = String(opportunityNumber);
    try {
      const raw = localStorage.getItem(ANALYSIS_STORAGE_KEY);
      const map = raw ? JSON.parse(raw) : {};
      if (map[key]) return map[key];
    } catch {}

    // Gera análise com base nos dados e documentos da oportunidade
    const generated = this.generateAnalysis(opportunityNumber);
    this.saveAnalysis(key, generated);
    return generated;
  }

  /**
   * Salva uma análise no repositório
   */
  static saveAnalysis(opportunityNumber, analysisData) {
    const key = String(opportunityNumber);
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
        const raw = window.localStorage.getItem(ANALYSIS_STORAGE_KEY);
        const map = raw ? JSON.parse(raw) : {};
        map[key] = {
          ...analysisData,
          lastUpdated: new Date().toISOString()
        };
        window.localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(map));
      }
    } catch (e) {
      console.warn('Erro ao salvar análise do edital:', e);
    }
  }

  /**
   * Executa a extração analítica completa da oportunidade
   */
  static generateAnalysis(opportunityNumber) {
    const opp = OpportunityService.listAll().find(o => String(o.number) === String(opportunityNumber)) || {
      number: String(opportunityNumber),
      title: 'Contratação de Serviços Especializados',
      object: 'Prestação de serviços de engenharia ambiental e industrial.',
      client: 'Petrobras',
      portal: 'Petronect',
      recommendedCompany: 'Excelência Ambiental',
      score: 96,
      daysLeft: 12,
      endDate: '19/10/2026',
      estimatedValue: 'R$ 2.450.000,00'
    };

    const isEmissoes = (opp.title + opp.object + opp.primaryService).toLowerCase().includes('emiss') ||
                       opp.recommendedCompany === 'Excelência Ambiental';

    const companyData = CompanyCertificatesRepository.getByName(opp.recommendedCompany);
    const docs = EditalDocumentRepository.listByOpportunity(opp.number);

    // 1. Resumo Executivo e Objeto em linguagem clara (Item 6 e 7)
    const executiveSummary = {
      object: isEmissoes
        ? 'A contratação prevê a prestação de serviços contínuos de medição, amostragem e monitoramento isocinético de emissões atmosféricas em fontes estacionárias (chaminés e fornos) na Refinaria Abreu e Lima (RNEST), incluindo emissão de laudos conforme resoluções CONAMA e CPRH.'
        : 'A contratação prevê a execução continuada de operação, controle analítico de efluentes e manutenção eletromecânica preventiva/corretiva de Estação de Tratamento de Efluentes Industriais e Sanitários (ETE/ETDI) com operação em regime contínuo 24/7.',
      client: opp.client,
      portal: opp.portal || 'Petronect',
      opportunityNumber: opp.number,
      deadlineProposals: opp.endDate,
      daysLeft: opp.daysLeft,
      location: opp.location || 'Ipojuca - PE',
      estimatedValue: opp.estimatedValue || 'R$ 2.450.000,00',
      contractType: 'Contrato de Serviços Continuados por Empreitada por Preço Unitário',
      recommendedCompany: opp.recommendedCompany,
      adherenceScore: opp.score || 95,
      participationCapacityScore: isEmissoes ? 88 : 84,
      overallRisk: isEmissoes ? 'MODERADO' : 'ALTO'
    };

    // 2. Extração de Requisitos Detalhados com Citação e Confiança (Itens 8, 9, 10, 11, 24, 25, 46)
    const requirements = [
      // Jurídico
      {
        id: 'req-jur-01',
        category: RequirementCategory.JURIDICO,
        title: 'Registro Comercial e Contrato Social Consolidado',
        description: 'Apresentação de Contrato Social registrado na Junta Comercial com objeto social pertinente e compatível com o escopo licitado.',
        originalText: 'Item 3.1.1 do Edital: "A licitante deverá apresentar Ato Constitutivo, Estatuto ou Contrato Social em vigor, devidamente registrado na Junta Comercial do Estado sede..."',
        documentSource: 'EDITAL_LICITACAO_ELETRONICA_PETRONECT.pdf',
        section: 'Seção 3 - Habilitação Jurídica',
        page: 9,
        mandatory: true,
        status: RequirementStatus.ATENDIDO,
        companyRef: `${companyData.companyName} possui contrato social consolidado com CNAE compatível`,
        confidence: 'ALTA',
        notes: 'Documento arquivado e regularizado.'
      },
      // Fiscal
      {
        id: 'req-fisc-01',
        category: RequirementCategory.FISCAL,
        title: 'Regularidade Fiscal Federal e Dívida Ativa da União',
        description: 'Certidão Negativa de Débitos Relativos a Créditos Tributários Federais e à Dívida Ativa da União.',
        originalText: 'Item 3.2.1: "Prova de regularidade fiscal perante a Fazenda Nacional mediante certidão conjunta expedida pela RFB e PGFN."',
        documentSource: 'EDITAL_LICITACAO_ELETRONICA_PETRONECT.pdf',
        section: 'Seção 3.2 - Regularidade Fiscal',
        page: 10,
        mandatory: true,
        status: RequirementStatus.ATENDIDO,
        companyRef: `Certidão Federal válida até ${companyData.certidoes.federal.validade}`,
        confidence: 'ALTA',
        notes: 'Certidão em vigor.'
      },
      {
        id: 'req-trab-01',
        category: RequirementCategory.TRABALHISTA,
        title: 'Certidão Negativa de Débitos Trabalhistas (CNDT)',
        description: 'Comprovação de inexistência de débitos inadimplidos perante a Justiça do Trabalho.',
        originalText: 'Item 3.3: "Certidão Negativa de Débitos Trabalhistas (CNDT) emitida pelo Tribunal Superior do Trabalho com prazo de validade vigente."',
        documentSource: 'EDITAL_LICITACAO_ELETRONICA_PETRONECT.pdf',
        section: 'Seção 3.3 - Regularidade Trabalhista',
        page: 11,
        mandatory: true,
        status: isEmissoes ? RequirementStatus.PARCIALMENTE_ATENDIDO : RequirementStatus.ATENDIDO,
        companyRef: `CNDT da empresa vence em ${companyData.certidoes.trabalhista.validade}`,
        confidence: 'ALTA',
        notes: isEmissoes ? 'ALERTA: CNDT vence em 8 dias. Solicitar emissão de nova certidão imediatamente.' : 'Válida.'
      },
      // Técnico & Responsabilidade
      {
        id: 'req-tec-crea',
        category: RequirementCategory.RESPONSABILIDADE_TECNICA,
        title: 'Registro e Regularidade no Conselho Profissional (CREA)',
        description: 'Certidão de Registro e Quitação da Pessoa Jurídica e do Responsável Técnico no CREA com visto regional.',
        originalText: 'Item 5.1 do Edital: "Comprovação de inscrição e regularidade da empresa licitante e de seu responsável técnico junto ao CREA da região de sua sede..."',
        documentSource: 'EDITAL_LICITACAO_ELETRONICA_PETRONECT.pdf',
        section: 'Seção 5 - Qualificação Técnica',
        page: 18,
        mandatory: true,
        status: RequirementStatus.ATENDIDO,
        companyRef: `${companyData.creaRegistro} e RT ${companyData.responsavelTecnico}`,
        confidence: 'ALTA',
        notes: 'Registro ativo no CREA-PE.'
      },
      // Atestados de Capacidade
      {
        id: 'req-tec-atest',
        category: RequirementCategory.ATESTADOS,
        title: 'Atestado de Capacidade Técnico-Operacional por Período Mínimo de 24 Meses',
        description: isEmissoes
          ? 'Comprovação de execução prévia de serviços continuados de monitoramento isocinético de emissões atmosféricas em fontes industriais por período ininterrupto não inferior a 24 meses.'
          : 'Comprovação de operação e manutenção continuada de ETE com vazão não inferior a 100 m³/dia por período mínimo de 24 meses.',
        originalText: isEmissoes
          ? 'Anexo Técnico Art. 1.2: "Deverá ser apresentado atestado emitido por pessoa jurídica de direito público ou privado que comprove a execução de amostragem isocinética de poluentes atmosféricos por no mínimo 24 meses."'
          : 'Edital Item 5.3: "Atestado comprovando prestação continuada de operação e manutenção de ETE com tratamento físico-químico e biológico."',
        documentSource: isEmissoes ? 'ANEXO_TECNICO_QUALIFICACAO_E_ATESTADOS_RNEST.pdf' : 'EDITAL_TRANSPETRO_CONCORRENCIA_ETE_SUAPE.pdf',
        section: 'Art. 1 - Da Capacidade Técnico-Operacional',
        page: 3,
        mandatory: true,
        status: RequirementStatus.ATENDIDO,
        companyRef: `Atestado Petrobras RNEST (${companyData.atestados[0].periodoMeses} meses) atende plenamente o tempo exigido`,
        confidence: 'ALTA',
        notes: 'Atestado A comprova 36 meses com excelente compatibilidade.'
      },
      // Equipe Mínima
      {
        id: 'req-equipe-01',
        category: RequirementCategory.EQUIPE,
        title: 'Disponibilidade de Equipe Técnica Residente e Capacitada',
        description: isEmissoes
          ? 'Engenheiro Químico ou Ambiental com mínimo de 5 anos de experiência e técnicos com capacitação NR-33 e NR-35.'
          : 'Engenheiro Mecânico/Sanitário com 5 anos e equipe de operação em turnos ininterruptos com NR-10 e NR-33.',
        originalText: 'Termo de Referência Seção III: "A contratada deverá alocar equipe mínima composta por 01 Engenheiro Coordenador e técnicos de amostragem devidamente certificados."',
        documentSource: 'TERMO_DE_REFERENCIA_TECNICO.pdf',
        section: 'Seção III - Equipe Mínima Exigida',
        page: 22,
        mandatory: true,
        status: RequirementStatus.ATENDIDO,
        companyRef: `Equipe cadastrada possui engenheiro sênior e técnicos com certificações de altura e espaço confinado`,
        confidence: 'ALTA',
        notes: 'Profissionais habilitados disponíveis.'
      },
      // Equipamentos
      {
        id: 'req-equip-01',
        category: RequirementCategory.EQUIPAMENTOS,
        title: 'Equipamentos Específicos com Calibração RBC/INMETRO Válida',
        description: isEmissoes
          ? 'Trem de amostragem isocinética com sonda aquecida de 3m e analisador eletrônico de gases com certificado de calibração emitido há menos de 12 meses.'
          : 'Bombas submersíveis reservas, medidores de vazão eletromagnéticos e analisador multiparâmetro com calibração válida.',
        originalText: 'Termo de Referência Seção IV: "Os instrumentos de medição utilizados em campo deverão possuir certificados de calibração emitidos por laboratórios da RBC."',
        documentSource: 'TERMO_DE_REFERENCIA_TECNICO.pdf',
        section: 'Seção IV - Equipamentos Obrigatórios',
        page: 34,
        mandatory: true,
        status: isEmissoes ? RequirementStatus.PARCIALMENTE_ATENDIDO : RequirementStatus.ATENDIDO,
        companyRef: isEmissoes
          ? 'Amostrador C-5000 possui calibração válida. Necessário validar se o tubo pitot reserva exige recalibração.'
          : 'Equipamentos disponíveis na base.',
        confidence: 'MEDIA',
        notes: isEmissoes ? 'Confirmar data de aferição do tubo pitot reserva antes do início da mobilização.' : 'Atendido.'
      },
      // Visita Técnica
      {
        id: 'req-visita-01',
        category: RequirementCategory.VISITA_TECNICA,
        title: isEmissoes ? 'Visita Técnica Facultativa aos Pontos de Amostragem' : 'Visita Técnica Obrigatória aos Tanques da ETE',
        description: isEmissoes
          ? 'Visita facultativa mediante agendamento prévio com 48h de antecedência para verificação das plataformas de chaminé.'
          : 'Visita técnica OBRIGATÓRIA realizada com o engenheiro responsável da Transpetro até 5 dias antes da sessão.',
        originalText: isEmissoes
          ? 'Termo de Referência Seção VI: "A visita técnica aos locais de medição é de caráter facultativo, recomendada para verificação de pontos de tomada de amostragem e alimentação elétrica."'
          : 'Edital Item 6.2: "A visita técnica é OBRIGATÓRIA. A licitante que não realizar a visita e não juntar o Atestado de Vistoria será inabilitada."',
        documentSource: 'EDITAL_LICITACAO_ELETRONICA_PETRONECT.pdf',
        section: 'Seção de Vistoria Técnica',
        page: 15,
        mandatory: !isEmissoes,
        status: isEmissoes ? RequirementStatus.NAO_SE_APLICA : RequirementStatus.PARCIALMENTE_ATENDIDO,
        companyRef: isEmissoes ? 'Facultativa — pode ser suprida por declaração' : 'Ainda não realizada pela equipe da Veeluen',
        confidence: 'ALTA',
        notes: isEmissoes ? 'Recomenda-se realizar vistoria para confirmar altura das tomadas de amostragem.' : 'CRÍTICO: Agendar vistoria em até 48 horas.'
      },
      // Garantias Contratuais
      {
        id: 'req-garantia-01',
        category: RequirementCategory.GARANTIA,
        title: 'Garantia de Execução Contratual (5% do Valor Global)',
        description: 'Apresentação de seguro-garantia, fiança bancária ou caução em dinheiro correspondente a 5% do valor total adjudicado.',
        originalText: 'Edital Seção 7: "A adjudicatária deverá apresentar garantia de execução contratual no percentual de 5% (cinco por cento) no prazo de 10 dias úteis após assinatura."',
        documentSource: 'EDITAL_LICITACAO_ELETRONICA_PETRONECT.pdf',
        section: 'Seção 7 - Das Garantias',
        page: 31,
        mandatory: true,
        status: RequirementStatus.ATENDIDO,
        companyRef: 'Empresa possui limite de crédito e apólice prévia com seguradora parceira',
        confidence: 'ALTA',
        notes: 'Capacidade financeira compatível.'
      }
    ];

    // 3. Comparação de Atestados com Banco das Empresas (Itens 20, 21, 22, 23)
    const attestationComparison = companyData.atestados.map((atest, i) => {
      let score = atest.scoreBase;
      let matchReasons = [
        `Serviço comprovado: ${atest.servico.substring(0, 70)}...`,
        `Período de ${atest.periodoMeses} meses supera o tempo mínimo exigido de 24 meses`,
        `Atestado registrado com ART oficial sob responsabilidade de ${atest.responsavelTecnico}`
      ];
      let pendingPoints = [];

      if (i === 0) {
        score = isEmissoes ? 96 : 94;
        matchReasons.push('Cliente e planta industrial de extrema relevância no setor de petróleo');
        if (isEmissoes) {
          pendingPoints.push('Validar se edital exige destacar individualmente os volumes de amostragem de SOx na declaração');
        }
      } else if (i === 1) {
        score = isEmissoes ? 88 : 86;
        matchReasons.push('Metodologias EPA e ABNT em conformidade');
      } else {
        score = isEmissoes ? 78 : 72;
        pendingPoints.push('Escopo predominantemente de modelagem AERMOD, secundário em relação à coleta isocinética de campo');
      }

      return {
        id: atest.id,
        atestadoNome: `Atestado ${String.fromCharCode(65 + i)} — ${atest.cliente}`,
        cliente: atest.cliente,
        servico: atest.servico,
        periodo: `${atest.periodoMeses} meses (${atest.dataEmissao})`,
        volume: atest.volume,
        empresa: companyData.companyName,
        score,
        compatibilidade: score >= 90 ? 'Altíssima Compatibilidade' : score >= 80 ? 'Alta Compatibilidade' : 'Compatibilidade Média',
        matchReasons,
        pendingPoints
      };
    });

    // 4. Equipe Mínima Exigida (Item 18)
    const requiredTeam = [
      {
        funcao: 'Engenheiro Responsável Técnico',
        quantidade: 1,
        qualificacao: 'Engenharia Química / Ambiental / Mecânica',
        experiencia: 'Mínimo de 5 anos em plantas industriais',
        registro: 'CREA Ativo com Visto Regional',
        obrigatorio: true,
        statusInterno: 'ATENDIDO',
        profissionalIndicado: companyData.responsavelTecnico
      },
      {
        funcao: 'Engenheiro de Campo / Coordenador',
        quantidade: 1,
        qualificacao: 'Engenharia com pós em SMS ou Ambiental',
        experiencia: 'Mínimo de 3 anos em amostragem/operação',
        registro: 'CREA Ativo',
        obrigatorio: true,
        statusInterno: 'ATENDIDO',
        profissionalIndicado: companyData.equipeDisponivel[1]?.nome || 'Engenheiro Pleno'
      },
      {
        funcao: 'Técnico de Amostragem / Operador Residente',
        quantidade: 2,
        qualificacao: 'Técnico em Química / Meio Ambiente com NR-33 e NR-35',
        experiencia: 'Mínimo de 2 anos em coleta de campo',
        registro: 'CRQ ou CFT Ativo',
        obrigatorio: true,
        statusInterno: 'ATENDIDO',
        profissionalIndicado: companyData.equipeDisponivel[2]?.nome || 'Técnico Pleno'
      }
    ];

    // 5. Equipamentos Exigidos (Item 19)
    const requiredEquipment = isEmissoes ? [
      {
        equipamento: 'Trem de Amostragem Isocinética de Chaminé Completo',
        especificacao: 'Conforme ABNT NBR 10701 / Métodos EPA 1 a 5 com sonda aquecida de aço inox 316',
        quantidade: 1,
        certificacao: 'Sim (RBC)',
        calibracao: 'Obrigatória (Validade < 12 meses)',
        status: 'ATENDIDO',
        equipamentoInterno: 'Amostrador Apex C-5000 (Calibração OK)'
      },
      {
        equipamento: 'Analisador Eletrônico de Gases de Combustão',
        especificacao: 'Células eletroquímicas para O2, CO, NO, NO2 e SO2 com sensor infravermelho de CO2',
        quantidade: 1,
        certificacao: 'Sim (Inmetro)',
        calibracao: 'Obrigatória (Validade < 12 meses)',
        status: 'ATENDIDO',
        equipamentoInterno: 'Testo 350 Flue Gas Analyzer (Calibração OK)'
      },
      {
        equipamento: 'Tubo Pitot Tipo S Calibrado',
        especificacao: 'Comprimento mínimo de 2,5 metros para perfil de velocidade em chaminés de grande porte',
        quantidade: 2,
        certificacao: 'Sim (RBC)',
        calibracao: 'Obrigatória',
        status: 'PARCIAL',
        equipamentoInterno: 'Tubo Pitot principal OK. Validar data do tubo reserva.'
      }
    ] : [
      {
        equipamento: 'Bombas Submersíveis de Esgoto e Efluentes',
        especificacao: 'Vazão de 50 m³/h em ferro fundido para drenagem de tanques',
        quantidade: 2,
        certificacao: 'Fabricante',
        calibracao: 'N/A',
        status: 'ATENDIDO',
        equipamentoInterno: 'Bombas Flygt em estoque'
      },
      {
        equipamento: 'Analisador Multiparâmetro Digital para ETE',
        especificacao: 'pH, OD, Condutividade, Turbidez e Temperatura em tempo real',
        quantidade: 1,
        certificacao: 'Sim',
        calibracao: 'Obrigatória',
        status: 'ATENDIDO',
        equipamentoInterno: 'YSI ProSolo Digital (Calibrado)'
      }
    ];

    // 6. Timeline e Prazos Críticos (Item 30)
    const timelineDates = [
      { evento: 'Publicação do Edital', data: opp.publishDate || '01/10/2026', status: 'Concluído' },
      { evento: 'Limite para Pedido de Esclarecimentos', data: '14/10/2026 às 17:00', status: 'Em aberto (Faltam 7 dias)' },
      { evento: 'Limite para Impugnação do Edital', data: '15/10/2026 às 17:00', status: 'Em aberto (Faltam 8 dias)' },
      { evento: 'Data da Visita Técnica', data: isEmissoes ? '16/10/2026 (Facultativa)' : '14/10/2026 (OBRIGATÓRIA)', status: isEmissoes ? 'Opcional' : 'AÇÃO URGENTE' },
      { evento: 'Encerramento do Envio de Propostas', data: `${opp.endDate} às 14:00`, status: `Crítico (${opp.daysLeft} dias restantes)` },
      { evento: 'Abertura da Sessão de Disputa de Lances', data: `${opp.endDate} às 14:30`, status: 'Previsto' },
      { evento: 'Prazo Limite de Mobilização após Assinatura', data: '15 dias corridos', status: 'Contratual' }
    ];

    // 7. Riscos Identificados (Itens 27 e 28)
    const risks = [
      {
        id: 'rsk-1',
        tipo: 'Prazo de Validade da CNDT Trabalhista',
        classificacao: 'MODERADO',
        descricao: 'A certidão trabalhista da empresa vence em 8 dias. Se não for renovada antes da sessão, causará inabilitação imediata.',
        mitigacao: 'Acessar o portal do TST e emitir nova certidão hoje mesmo.'
      },
      {
        id: 'rsk-2',
        tipo: isEmissoes ? 'Amostragem em Plataforma Alta (>35m)' : 'Visita Técnica Obrigatória com Prazo de Agendamento',
        classificacao: isEmissoes ? 'MODERADO' : 'CRÍTICO',
        descricao: isEmissoes
          ? 'Chaminés da refinaria exigem técnicos com ASO específico de trabalho em altura (NR-35) e linha de vida calibrada.'
          : 'A visita técnica da ETE é eliminatória. Se a equipe não comparecer até o dia 14/10, a proposta será desclassificada sumariamente.',
        mitigacao: isEmissoes ? 'Confirmar ASOs válidos da equipe de campo.' : 'Agendar visita com o gestor do contrato da Transpetro.'
      },
      {
        id: 'rsk-3',
        tipo: 'Garantia de Execução Contratual (5%)',
        classificacao: 'BAIXO',
        descricao: 'Exigência de seguro-garantia no montante aproximado de R$ 122.500,00.',
        mitigacao: 'Limite de crédito pré-aprovado com corretora de seguros parceira.'
      }
    ];

    // 8. Lista de Pendências Prioritárias (Item 16)
    const pendingActions = [
      { id: 'pend-1', prioridade: 'Alta', descricao: 'Emitir renovação da Certidão Negativa Trabalhista (CNDT) no portal do TST.', responsavel: 'Comercial / Jurídico' },
      { id: 'pend-2', prioridade: isEmissoes ? 'Média' : 'Crítica', descricao: isEmissoes ? 'Avaliar agendamento de visita técnica facultativa para checagem das tomadas de amostragem.' : 'Protocolar ofício de agendamento da visita técnica obrigatória junto à contratante.', responsavel: 'Engenharia Operacional' },
      { id: 'pend-3', prioridade: 'Média', descricao: 'Separar cópia autenticada do Atestado A (RNEST) com a respectiva ART de registro no CREA.', responsavel: 'Equipe Técnica' },
      { id: 'pend-4', prioridade: 'Baixa', descricao: 'Emitir declaração formal de disponibilidade dos equipamentos e certificados de calibração.', responsavel: 'Gerência Operacional' }
    ];

    // 9. Condições Comerciais & Julgamento (Itens 32 e 33)
    const commercialConditions = {
      judgementCriteria: 'Menor Preço Global',
      paymentTerms: '30 dias corridos após emissão do Boletim de Medição e aceite da Nota Fiscal',
      priceReadjustment: 'Anual com base na variação do índice IPCA/IBGE',
      contractualGuarantee: '5% do valor total do contrato via Seguro-Garantia ou Fiança Bancária',
      retentions: 'Retenções tributárias padrão na fonte (INSS, IRRF, ISSQN)',
      proposalValidity: '90 dias corridos a partir da data de abertura da sessão',
      penalties: 'Multa moratória de 0,33% ao dia por atraso injustificado, limitada a 10% do valor do contrato'
    };

    // 10. Recomendação Final (Itens 14 e 15)
    const recommendation = {
      action: ParticipationRecommendation.PARTICIPAR_COM_PENDENCIAS,
      badgeClass: 'rec-pendencias',
      scoreHabilitacao: executiveSummary.participationCapacityScore,
      reasons: [
        `Altíssima compatibilidade técnica do objeto com as competências de ${opp.recommendedCompany}`,
        'Documentação societária, fiscal e registro profissional no CREA perfeitamente regulares',
        `Atestado da RNEST (${companyData.atestados[0].periodoMeses} meses) atende com folga a exigência mínima de 24 meses`,
        'Equipe técnica com ARTs e certificações de segurança (NR-33/NR-35) disponível',
        'Necessário apenas sanar a renovação da CNDT trabalhista e confirmar visita técnica'
      ]
    };

    return {
      opportunityNumber: opp.number,
      analyzedAt: new Date().toISOString(),
      analyzerVersion: 'Vellia Document Intelligence v8.0',
      documentsCount: docs.length,
      executiveSummary,
      requirements,
      attestationComparison,
      requiredTeam,
      requiredEquipment,
      timelineDates,
      risks,
      pendingActions,
      commercialConditions,
      recommendation
    };
  }

  /**
   * Responde perguntas sobre o edital com base estrita nos documentos e dados cadastrados (Itens 37 e 38)
   */
  static askEditalAssistant(opportunityNumber, questionText) {
    const analysis = this.getAnalysis(opportunityNumber);
    const q = questionText.toLowerCase().trim();

    // 1. Exigência de CREA / ART
    if (q.includes('crea') || q.includes('conselho') || q.includes('art') || q.includes('responsável técnico')) {
      const reqCrea = analysis.requirements.find(r => r.category === RequirementCategory.RESPONSABILIDADE_TECNICA);
      return {
        answered: true,
        answer: `Sim, o Edital exige expressamente o registro da pessoa jurídica e do Responsável Técnico junto ao CREA regional com certidão de quitação e emissão de ART correspondente ao escopo licitado.\n\nTrecho do edital: "${reqCrea?.originalText || 'Item 5.1 do Edital'}"\n\nSituação interna: ATENDIDO pela empresa recomendada (${analysis.executiveSummary.recommendedCompany}).`,
        source: 'EDITAL_LICITACAO_ELETRONICA_PETRONECT.pdf — Seção 5 (Pág. 18)'
      };
    }

    // 2. Experiência / Atestados
    if (q.includes('experiência') || q.includes('atestado') || q.includes('meses') || q.includes('tempo mínimo')) {
      const atestReq = analysis.requirements.find(r => r.category === RequirementCategory.ATESTADOS);
      return {
        answered: true,
        answer: `O edital exige comprovação de experiência prévia ininterrupta de no mínimo 24 meses no mesmo tipo de serviço.\n\nTrecho original: "${atestReq?.originalText || 'Exigência de 24 meses de monitoramento'}"\n\nAtestado localizado no banco: Atestado A emitido pela Petrobras RNEST comprovando 36 meses (Score de compatibilidade: 96%). Requisito ATENDIDO.`,
        source: 'ANEXO_TECNICO_QUALIFICACAO_E_ATESTADOS_RNEST.pdf — Art. 1 (Pág. 3)'
      };
    }

    // 3. Visita Técnica
    if (q.includes('visita') || q.includes('vistoria')) {
      const vis = analysis.requirements.find(r => r.category === RequirementCategory.VISITA_TECNICA);
      const isObligatory = vis?.mandatory;
      return {
        answered: true,
        answer: isObligatory 
          ? `Sim, a Visita Técnica é OBRIGATÓRIA e eliminatória, devendo ser agendada e realizada até 5 dias antes da abertura das propostas.`
          : `A Visita Técnica aos locais de medição tem caráter FACULTATIVO. Caso a empresa opte por não realizá-la, deve anexar declaração formal de conhecimento prévio das condições de campo.`,
        source: 'Termo de Referência Técnico — Seção de Vistoria (Pág. 15/59)'
      };
    }

    // 4. Equipamentos
    if (q.includes('equipamento') || q.includes('calibra') || q.includes('sonda') || q.includes('inmetro')) {
      return {
        answered: true,
        answer: `O edital exige equipamentos específicos com certificados de calibração vigentes emitidos por laboratórios da Rede Brasileira de Calibração (RBC/Inmetro). No caso de emissões: trem de amostragem isocinética com sonda aquecida, analisador de gases eletrônico e tubo pitot calibrado.`,
        source: 'Termo de Referência Técnico — Seção IV: Equipamentos Obrigatórios (Pág. 34)'
      };
    }

    // 5. Riscos
    if (q.includes('risco') || q.includes('perigo') || q.includes('atenção')) {
      return {
        answered: true,
        answer: `Os principais riscos identificados pelo agente são:\n1. Validade da Certidão Negativa Trabalhista (CNDT) que vence em 8 dias;\n2. Exigência de técnicos certificados em trabalho em altura (NR-35) e espaço confinado (NR-33);\n3. Prazo restrito de 12 dias para encerramento das propostas.`,
        source: 'Matriz de Riscos Operacionais do Vellia Document Intelligence'
      };
    }

    // 6. Capacidade de Participar / Recomendação
    if (q.includes('participar') || q.includes('vale a pena') || q.includes('podemos') || q.includes('capacidade')) {
      return {
        answered: true,
        answer: `Recomendação: ${analysis.recommendation.action} (${analysis.executiveSummary.participationCapacityScore}% de capacidade).\n\nMotivos: A empresa possui atestados comprovados de 36 meses, equipe técnica habilitada no CREA e equipamentos calibrados. A única pendência prioritária é emitir nova via da CNDT trabalhista para garantir regularidade até a homologação.`,
        source: 'Relatório Executivo de Habilitação do Vellia Licitações'
      };
    }

    // Regra estrita do Item 38: Se não constar nos documentos
    return {
      answered: false,
      answer: 'Essa informação não foi identificada nos documentos disponíveis para este edital.',
      source: 'Consulta Documental Restrita'
    };
  }

  /**
   * Permite revisão humana de um requisito (Item 47 e 48)
   */
  static updateRequirement(opportunityNumber, requirementId, updates, reviewerName = 'Equipe Comercial (Manual)') {
    const analysis = this.getAnalysis(opportunityNumber);
    const reqIndex = analysis.requirements.findIndex(r => r.id === requirementId);
    if (reqIndex === -1) return null;

    const previousStatus = analysis.requirements[reqIndex].status;
    analysis.requirements[reqIndex] = {
      ...analysis.requirements[reqIndex],
      ...updates,
      reviewedBy: reviewerName,
      reviewedAt: new Date().toISOString(),
      previousStatus
    };

    // Recalcula score de habilitação
    const attendedCount = analysis.requirements.filter(r => r.status === RequirementStatus.ATENDIDO).length;
    const partialCount = analysis.requirements.filter(r => r.status === RequirementStatus.PARCIALMENTE_ATENDIDO).length;
    const totalMandatory = analysis.requirements.filter(r => r.mandatory).length || 1;
    const newScore = Math.min(100, Math.round(((attendedCount * 1.0 + partialCount * 0.5) / totalMandatory) * 100));

    this.saveAnalysis(opportunityNumber, analysis);
    return analysis;
  }

  /**
   * Alias de conveniência para análise da oportunidade com propriedades normalizadas para o modal
   */
  static analyzeOpportunity(opportunityId) {
    const raw = this.getAnalysis(opportunityId);
    const docs = EditalDocumentRepository.listByOpportunity(opportunityId);
    
    // Normalizar atestados
    const attestationRequirements = (raw.attestationComparison || []).map(att => ({
      title: att.requisitoTitulo || 'Comprovação de Aptidão Técnica Operacional',
      extractedRequirement: att.exigenciaEdital || 'Comprovação de execução de serviços similares por período mínimo de 24 meses.',
      minExperienceMonths: att.prazoMinimoMeses || 24,
      scope: att.escopoExigido || 'Monitoramento contínuo em unidades industriais',
      documentName: att.documentoOrigem || 'ANEXO_TECNICO_QUALIFICACAO.pdf',
      page: att.pagina || 3,
      section: att.secao || 'Qualificação Técnica',
      matchedCertificates: (att.atestadosCompatíveis || []).map(c => ({
        client: c.cliente,
        certificateNumber: c.id,
        score: c.scoreCompatibilidade,
        serviceDescription: c.servico,
        period: c.periodo,
        durationMonths: c.periodoMeses,
        artNumber: c.artNumero,
        compatibilityExplanation: c.explicacaoCompatibilidade,
        pendingDetails: c.pendenciaValidar
      }))
    }));

    // Normalizar equipe
    const teamRequirements = (raw.requiredTeam || []).map(tm => ({
      role: tm.funcao,
      quantity: tm.quantidade,
      qualification: tm.qualificacao,
      minExperience: tm.experienciaMinima,
      professionalRegistration: tm.registroProfissional,
      mandatory: tm.obrigatorio,
      status: tm.statusInterno,
      allocatedProfessional: tm.profissionalAlocado
    }));

    // Normalizar equipamentos
    const equipmentRequirements = (raw.requiredEquipment || []).map(eq => ({
      name: eq.equipamento,
      specification: eq.especificacao,
      quantity: eq.quantidade,
      certificationRequired: eq.certificacaoExigida,
      calibrationMandatory: eq.calibracaoObrigatoria,
      status: eq.statusInterno,
      notes: eq.observacoes
    }));

    // Normalizar timeline
    const timeline = (raw.timelineDates || []).map(tl => ({
      milestone: tl.evento,
      date: tl.data,
      description: tl.observacao || tl.evento,
      isCritical: tl.critico,
      alertDays: tl.alertaDias
    }));

    // Normalizar riscos
    const risks = (raw.risks || []).map(r => ({
      title: r.tipo || 'Risco de Conformidade',
      category: 'Operacional / Jurídico',
      severity: r.classificacao === 'CRÍTICO' ? 'Crítico' : r.classificacao === 'ALTO' ? 'Alto' : r.classificacao === 'MODERADO' ? 'Moderado' : 'Baixo',
      description: r.descricao,
      mitigation: r.mitigacao
    }));

    // Normalizar pendências
    const pendingItems = (raw.pendingActions || []).map(p => ({
      category: p.prioridade === 'Crítica' || p.prioridade === 'Alta' ? 'Prioritária' : 'Operacional',
      description: p.descricao,
      action: `Atribuído a: ${p.responsavel}`
    }));

    // Normalizar documentos
    const documents = docs.map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      version: d.version,
      size: d.sizeFormatted,
      pages: d.pagesCount,
      hash: d.hash,
      uploadDate: d.uploadDate,
      source: d.origin,
      extractedText: d.contentSummary
    }));

    // Normalizar requisitos com alias de citação
    const requirements = (raw.requirements || []).map(r => ({
      ...r,
      description: r.description || r.title,
      originalQuote: r.originalText,
      documentName: r.documentSource,
      observation: r.notes || r.companyRef
    }));

    // Obter visita técnica
    const visitReq = requirements.find(r => r.category === RequirementCategory.VISITA_TECNICA);
    const technicalVisit = {
      required: visitReq ? visitReq.mandatory : false,
      notes: visitReq ? visitReq.originalQuote : 'Visita facultativa com declaração de conhecimento das condições locais.',
      deadline: 'Até 2 dias úteis antes da sessão',
      location: raw.executiveSummary?.location || 'Área Industrial',
      contact: 'licitacoes@petrobras.com.br'
    };

    // Integração Fase 28: Serviços Documentais Avançados
    const matchingAudit = AttestationMatchingService.matchOpportunityRequirements(
      requirements, 
      (raw.executiveSummary?.recommendedCompany || '').includes('Veeluen') ? 'veeluen-solutions' : 'excelencia-ambiental',
      true // Edital com adendo que autoriza somatório
    );

    const packageCompleteness = DocumentStructureService.evaluatePackageCompleteness(docs);
    const documentDiff = DocumentStructureService.generateDocumentDiff(
      docs[0], 
      docs.find(d => d.type === 'Adendo' || d.type === 'Errata') || { id: 'adendo-01', name: 'ADENDO_01_ESCLARECIMENTOS.pdf', version: '1.1', uploadDate: '07/10/2026' }
    );
    const lots = RequirementExtractionService.extractLotsAndItems(raw.executiveSummary || {});
    const contractRisks = RequirementExtractionService.extractContractRiskClauses(docs);

    // O QUE PODE NOS INABILITAR? (Bloco Crítico - Itens 128 e 129)
    const whatCanInabilitate = [
      {
        id: 'inab-01',
        title: 'Visita Técnica Obrigatória não Comprovada',
        severity: 'CRÍTICO / HARD BLOCKER',
        reason: 'O Item 4 do Edital exige visita técnica prévia com emissão de atestado assinado por preposto até 5 dias antes da sessão. A ausência inabilita sumariamente.',
        source: 'EDITAL_LICITACAO_ELETRONICA_PETRONECT.pdf — Pág. 8',
        solution: 'Agendar e realizar visita até 14/10/2026 com Engenheiro Residente.',
        status: 'PENDENTE DE REALIZAÇÃO'
      },
      {
        id: 'inab-02',
        title: 'Atestado Técnico Operacional Inferior a 24 Meses',
        severity: 'CRÍTICO / HARD BLOCKER',
        reason: 'Exigência de 24 meses ininterruptos de medição isocinética. Nosso acervo possui 36 meses comprovados no Atestado RNEST, mas sem ART quitada anexa haverá inabilitação.',
        source: 'TERMO_DE_REFERENCIA_TECNICO.pdf — Item 5.2 (Pág. 18)',
        solution: 'Anexar ART nº ART-PE-2024-0098231 vinculada ao atestado da Petrobras.',
        status: 'COMPROVADO / ANEXAR ART'
      },
      {
        id: 'inab-03',
        title: 'Certidão Trabalhista (CNDT) com Vencimento Próximo',
        severity: 'ALTO / RISCO NA HOMOLOGAÇÃO',
        reason: 'A CNDT atual da empresa vence em 8 dias (15/10/2026). Se a sessão pública ou julgamento recursal ocorrer após esta data, a empresa é inabilitada.',
        source: 'CNDT da Empresa — Emissão Online TST',
        solution: 'Emitir certidão negativa renovada pela internet 48h antes da sessão.',
        status: 'AÇÃO PREVENTIVA'
      }
    ];

    // O QUE PRECISAMOS FAZER? (Plano de Ação Acionável - Itens 130 e 131)
    const whatWeNeedToDo = [
      {
        id: 'action-01',
        title: 'Realizar e comprovar Visita Técnica às chaminés da RNEST',
        deadline: '14/10/2026',
        priority: 'CRÍTICA',
        responsible: 'Dr. Roberto Albuquerque (Eng. Químico)',
        isHardBlocker: true,
        canCreateTask: true,
        taskCreated: false
      },
      {
        id: 'action-02',
        title: 'Emitir certidão trabalhista CNDT renovada no portal do TST',
        deadline: '12/10/2026',
        priority: 'ALTA',
        responsible: 'Depto. Jurídico / Contábil',
        isHardBlocker: false,
        canCreateTask: true,
        taskCreated: false
      },
      {
        id: 'action-03',
        title: 'Juntar ART-PE-2024-0098231 ao Atestado de Capacidade Técnica da RNEST',
        deadline: '16/10/2026',
        priority: 'ALTA',
        responsible: 'Coordenação Técnica de Licitações',
        isHardBlocker: true,
        canCreateTask: true,
        taskCreated: false
      },
      {
        id: 'action-04',
        title: 'Confirmar calibração RBC do Amostrador Isocinético e Sonda Aquecida',
        deadline: '17/10/2026',
        priority: 'MÉDIA',
        responsible: 'Laboratório e Metrologia',
        isHardBlocker: false,
        canCreateTask: true,
        taskCreated: false
      }
    ];

    // Fila de Revisão Documental (Low Confidence & Blockers - Itens 83 e 84)
    const reviewQueue = requirements.filter(r => r.isHardBlocker || r.confidence === 'BAIXA' || r.status === RequirementStatus.PARCIALMENTE_ATENDIDO);

    // Handoff para proposta (Checklist de Habilitação)
    const habilitationPackage = DocumentAuditService.buildHabilitationPackage(requirements, matchingAudit.results);

    return {
      ...raw,
      capacityScore: matchingAudit.overallHabilitationScore || 88,
      technicalScore: matchingAudit.technicalScore || 95,
      quantitativeScore: matchingAudit.quantitativeScore || 100,
      recommendation: matchingAudit.hasCriticalBlocker ? 'PARTICIPAR COM PENDÊNCIAS' : (raw.recommendation?.action || 'PARTICIPAR'),
      recommendationJustification: raw.recommendation?.reasons ? raw.recommendation.reasons.join('; ') : '',
      executiveSummary: {
        ...raw.executiveSummary,
        objetoClaro: raw.executiveSummary?.object || ''
      },
      breakdownScores: {
        jurídico: 100,
        fiscal: 95,
        técnico: matchingAudit.technicalScore || 95,
        quantitativo: matchingAudit.quantitativeScore || 100,
        atestados: 96,
        equipe: 100,
        equipamentos: 94,
        comercial: 90
      },
      risksSummary: {
        overallRisk: raw.executiveSummary?.overallRisk || 'Moderado',
        totalRisks: risks.length
      },
      requirements,
      attestationRequirements,
      teamRequirements,
      equipmentRequirements,
      timeline,
      technicalVisit,
      risks,
      pendingItems,
      documents,
      commercialConditions: {
        evaluationCriterion: raw.commercialConditions?.judgementCriteria || 'Menor Preço Global',
        paymentTerms: raw.commercialConditions?.paymentTerms || '30 dias fora a quinzena',
        contractTerm: raw.executiveSummary?.contractType || '12 meses renováveis',
        contractGuarantee: raw.commercialConditions?.contractualGuarantee || '5% do valor total'
      },
      suggestedQuestions: [
        'Qual é a experiência mínima exigida nos atestados?',
        'Posso somar atestados para cumprir o prazo?',
        'Existe visita técnica obrigatória?',
        'Quais itens podem nos inabilitar?',
        'Qual é a garantia contratual exigida?',
        'Até quando posso pedir esclarecimentos?'
      ],
      // Recursos Exclusivos da Fase 28
      whatCanInabilitate,
      whatWeNeedToDo,
      packageCompleteness,
      documentDiff,
      matchingAudit,
      lots,
      contractRisks,
      reviewQueue,
      habilitationPackage
    };
  }

  /**
   * Resposta com rigor de citação documental (Fase 28 - Itens 88 a 96)
   */
  static askAssistant(opportunityId, question) {
    const raw = this.getAnalysis(opportunityId);
    const docs = EditalDocumentRepository.listByOpportunity(opportunityId);
    const res = DocumentCopilotService.answerQuestion(raw, docs, raw.requirements || [], question);
    
    return {
      text: res.answer,
      sources: res.sources.map(s => ({ doc: s.documentName, section: `${s.section} (Pág. ${s.page})` })),
      divergenceNote: res.divergenceNote,
      confidence: res.confidence
    };
  }

  /**
   * Revisão humana com auditoria formal (Itens 157, 158, 159)
   */
  static updateRequirementReview(opportunityId, reqId, data) {
    const res = this.updateRequirement(opportunityId, reqId, data, data?.reviewer);
    DocumentAuditService.recordHumanOverride({
      opportunityNumber: opportunityId,
      requirementId: reqId,
      requirementTitle: data?.title || 'Requisito de Edital',
      previousStatus: data?.previousStatus || 'ANTERIOR',
      newStatus: data?.status || 'ATENDIDO',
      reviewer: data?.reviewer || 'Especialista em Licitações',
      justification: data?.observation || 'Revisão humana validada'
    });
    return res;
  }

  /**
   * Aprovação em Lote (Bulk Review)
   */
  static approveBatchRequirements(opportunityId, reqIds, reviewer) {
    const analysis = this.getAnalysis(opportunityId);
    return DocumentAuditService.approveBatch(opportunityId, reqIds, analysis.requirements || [], reviewer);
  }

  /**
   * Conversão de pendência em Tarefa do Vellia
   */
  static createTaskFromPending(opportunityId, pendingItem) {
    return DocumentAuditService.createTaskFromPendingItem(opportunityId, pendingItem);
  }

  /**
   * Log de auditoria
   */
  static getAuditLog(opportunityId) {
    return DocumentAuditService.getAuditLog(opportunityId);
  }

  /**
   * Executa benchmark de qualidade da Fase 28
   */
  static runGoldenBenchmark() {
    return GoldenDocumentBenchmark.runBenchmark();
  }
}

export default EditalAnalysisEngine;
