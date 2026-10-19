/**
 * VELLIA LICITAÇÕES — FASE 29
 * DOCUMENT TEMPLATE LIBRARY (BIBLIOTECA DE MODELOS DOCUMENTAIS)
 * 
 * Contém modelos padrão de declarações oficiais exigidas pela Lei 14.133/2021 e editais públicos,
 * com motor de substituição de variáveis estruturadas e placeholders controlados.
 * 
 * Regra fundamental: NUNCA inventar dados empresariais. Se faltar, usar placeholder [INFORMAR ...].
 */

export const DocumentTemplateCategory = {
  LICITACAO: 'Licitação',
  HABILITACAO: 'Habilitação',
  TECNICA: 'Técnica',
  ADMINISTRATIVA: 'Administrativa',
  COMERCIAL: 'Comercial'
};

export const documentTemplates = [
  {
    id: 'tpl-fatos-impeditivos',
    title: 'Declaração de Inexistência de Fatos Impeditivos',
    category: DocumentTemplateCategory.HABILITACAO,
    source: 'Modelo da Lei 14.133/2021 (Art. 14)',
    description: 'Declara que a empresa não se encontra declarada inidônea, suspensa de licitar ou impedida de contratar com a Administração Pública.',
    requiredVariables: ['company.legalName', 'company.cnpj', 'representative.name', 'representative.cpf', 'opportunity.number', 'contractingOrganization.name'],
    templateText: `DECLARAÇÃO DE INEXISTÊNCIA DE FATOS IMPEDITIVOS

À COMISSÃO DE CONTRATAÇÃO / AGENTE DE CONTRATAÇÃO
{{contractingOrganization.name}}
REF.: EDITAL / LICITAÇÃO Nº {{opportunity.number}}

A empresa {{company.legalName}}, inscrita no CNPJ sob o nº {{company.cnpj}}, com sede em {{company.address}}, por intermédio de seu representante legal infra-assinado, Sr.(a) {{representative.name}}, portador(a) do CPF nº {{representative.cpf}}, ocupante do cargo de {{representative.role}}, DECLARA, sob as penas da lei, para fins de participação no certame supracitado:

1. Que não foi declarada inidônea para licitar ou contratar com a Administração Pública Federal, Estadual ou Municipal, nos termos do art. 14 da Lei Federal nº 14.133/2021;
2. Que não se encontra suspensa do direito de licitar ou impedida de contratar com o órgão licitante;
3. Que inexistem fatos impeditivos supervenientes à sua habilitação, comprometendo-se a comunicar qualquer ocorrência superveniente que venha a alterar sua regularidade jurídica ou fiscal.

Por ser a expressão da verdade, firmamos a presente.

{{company.cityState}}, {{currentDate}}.

__________________________________________________
{{representative.name}}
{{representative.role}} — {{company.legalName}}
CPF: {{representative.cpf}}`
  },
  {
    id: 'tpl-cumprimento-habilitacao',
    title: 'Declaração de Pleno Cumprimento dos Requisitos de Habilitação',
    category: DocumentTemplateCategory.HABILITACAO,
    source: 'Modelo da Lei 14.133/2021 (Art. 63, I)',
    description: 'Declaração formal de atendimento a todos os requisitos de qualificação jurídica, técnica, fiscal, social e trabalhista.',
    requiredVariables: ['company.legalName', 'company.cnpj', 'representative.name', 'representative.cpf', 'opportunity.number'],
    templateText: `DECLARAÇÃO DE PLENO CUMPRIMENTO DOS REQUISITOS DE HABILITAÇÃO

AO {{contractingOrganization.name}}
EDITAL: {{opportunity.number}}
OBJETO: {{opportunity.object}}

A pessoa jurídica {{company.legalName}}, inscrita no CNPJ sob o nº {{company.cnpj}}, sediada em {{company.address}}, por seu representante legal, {{representative.name}}, inscrito(a) no CPF nº {{representative.cpf}}, DECLARA EXPRESSAMENTE, sob as cominações do art. 299 do Código Penal e em cumprimento ao disposto no art. 63, inciso I, da Lei nº 14.133/2021:

Que cumpre plenamente todos os requisitos de habilitação fixados no Edital de Licitação nº {{opportunity.number}} e seus Anexos, possuindo capacidade jurídica, regularidade fiscal, social e trabalhista, qualificação econômico-financeira e aptidão técnica necessária para a integral execução do objeto licitado.

Local e data: {{company.cityState}}, {{currentDate}}.

__________________________________________________
{{representative.name}}
{{representative.role}}
{{company.legalName}}`
  },
  {
    id: 'tpl-trabalho-menores',
    title: 'Declaração Relativa ao Trabalho de Menores',
    category: DocumentTemplateCategory.HABILITACAO,
    source: 'Art. 7º, XXXIII da CF/88 e Lei 9.854/99',
    description: 'Declaração obrigatória constitucional atestando não empregar menor de 18 anos em trabalho noturno, perigoso ou insalubre, nem menor de 16 anos (salvo aprendiz).',
    requiredVariables: ['company.legalName', 'company.cnpj', 'representative.name', 'representative.cpf'],
    templateText: `DECLARAÇÃO RELATIVA AO TRABALHO DE MENORES

A empresa {{company.legalName}}, com sede na {{company.address}}, inscrita no CNPJ nº {{company.cnpj}}, neste ato representada por seu representante legal {{representative.name}}, portador do CPF nº {{representative.cpf}}:

DECLARA, para fins do disposto no inciso V do art. 68 da Lei Federal nº 14.133/2021 e no inciso XXXIII do art. 7º da Constituição da República Federativa do Brasil de 1988:

Que não emprega menor de dezoito anos em trabalho noturno, perigoso ou insalubre e não emprega menor de dezesseis anos em qualquer trabalho, salvo na condição de aprendiz, a partir de quatorze anos.

(  ) Emprega menor, a partir de quatorze anos, na condição de aprendiz.
(X) Não emprega menores de dezesseis anos.

{{company.cityState}}, {{currentDate}}.

__________________________________________________
{{representative.name}}
{{company.legalName}}`
  },
  {
    id: 'tpl-lgpd',
    title: 'Declaração de Conformidade com a LGPD',
    category: DocumentTemplateCategory.ADMINISTRATIVA,
    source: 'Lei Geral de Proteção de Dados (Lei 13.709/2018)',
    description: 'Termo de compromisso de privacidade e segurança da informação no tratamento de dados pessoais no âmbito do contrato.',
    requiredVariables: ['company.legalName', 'company.cnpj', 'representative.name'],
    templateText: `DECLARAÇÃO DE CONFORMIDADE COM A LEI GERAL DE PROTEÇÃO DE DADOS (LGPD)

A licitante {{company.legalName}}, CNPJ nº {{company.cnpj}}, sediada em {{company.address}}, por meio de seu representante legal infra-assinado, DECLARA, para todos os efeitos legais:

1. Que conhece e cumpre integralmente os preceitos da Lei Federal nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais - LGPD);
2. Que adota medidas técnicas e administrativas aptas a proteger os dados pessoais aos quais tiver acesso contra acessos não autorizados e contra situações acidentais ou ilícitas de destruição, perda ou alteração;
3. Que orienta sua equipe técnica sobre o dever de confidencialidade e sigilo profissional em relação a quaisquer dados tratados durante a execução do Contrato decorrente da Licitação nº {{opportunity.number}}.

{{company.cityState}}, {{currentDate}}.

__________________________________________________
{{representative.name}}
Representante Legal — {{company.legalName}}`
  },
  {
    id: 'tpl-disponibilidade-equipe',
    title: 'Declaração de Disponibilidade de Equipe e Equipamentos',
    category: DocumentTemplateCategory.TECNICA,
    source: 'Termo de Referência / Modelo do Edital',
    description: 'Declaração de disponibilidade de corpo técnico especializado e instrumental calibrado para mobilização.',
    requiredVariables: ['company.legalName', 'company.cnpj', 'representative.name', 'technicalManager.name', 'technicalManager.crea'],
    templateText: `DECLARAÇÃO DE DISPONIBILIDADE DE EQUIPE TÉCNICA E EQUIPAMENTOS

À {{contractingOrganization.name}}
PROCESSO / LICITAÇÃO: {{opportunity.number}}

A empresa {{company.legalName}}, CNPJ nº {{company.cnpj}}, sediada na {{company.address}}, registrada no CREA sob o nº {{company.crea}}, DECLARA:

1. Que dispõe de corpo técnico qualificado composto por profissionais habilitados, sob a Responsabilidade Técnica do(a) {{technicalManager.name}}, registro {{technicalManager.crea}}, com disponibilidade imediata para mobilização a partir da emissão da Ordem de Serviço;
2. Que possui ou tem garantido o acesso e locação a todos os equipamentos, instrumentos de medição e insumos necessários para a execução dos serviços de "{{opportunity.object}}", atendendo às normas técnicas da ABNT e critérios de calibração vigentes.

{{company.cityState}}, {{currentDate}}.

__________________________________________________
{{representative.name}} (Representante Legal)
{{technicalManager.name}} (Responsável Técnico - {{technicalManager.crea}})`
  },
  {
    id: 'tpl-visita-conhecimento',
    title: 'Declaração de Pleno Conhecimento do Local / Condições de Execução',
    category: DocumentTemplateCategory.TECNICA,
    source: 'Substituição Facultativa de Visita Técnica (Lei 14.133/21)',
    description: 'Declaração formal de conhecimento pleno das condições locais e operacionais caso a visita presencial seja dispensada/facultativa.',
    requiredVariables: ['company.legalName', 'company.cnpj', 'representative.name', 'opportunity.number'],
    templateText: `DECLARAÇÃO DE CONHECIMENTO DAS CONDIÇÕES LOCAIS E DE EXECUÇÃO

REF.: LICITAÇÃO Nº {{opportunity.number}}
ÓRGÃO CONTRATANTE: {{contractingOrganization.name}}

A empresa {{company.legalName}}, CNPJ nº {{company.cnpj}}, por intermédio de seu representante legal {{representative.name}}, DECLARA, sob sua exclusiva responsabilidade e sob as penas da lei:

1. Que tem pleno conhecimento das condições locais, características geográficas, logísticas e técnicas pertinentes à execução do objeto da presente licitação ("{{opportunity.object}}");
2. Que obteve todas as informações necessárias para a elaboração de sua Proposta Técnica e Comercial, não podendo alegar no futuro desconhecimento de qualquer elemento para justificar atrasos, aditivos indevidos ou inexecução contratual.

{{company.cityState}}, {{currentDate}}.

__________________________________________________
{{representative.name}}
{{company.legalName}}`
  }
];

export class DocumentTemplateEngine {
  /**
   * Substitui variáveis de forma controlada.
   * Se faltar informação essencial, usa placeholder seguro [INFORMAR ...] e avisa.
   */
  static render(templateText, context = {}) {
    if (!templateText) return { text: '', missingVariables: [] };

    const missingVariables = [];

    // Mapeamento plano para regex
    const variableMap = {
      'company.legalName': context.company?.legalName || null,
      'company.cnpj': context.company?.cnpj || null,
      'company.address': context.company?.address || null,
      'company.cityState': context.company?.cityState || (context.company?.city ? `${context.company.city}/${context.company.state}` : null),
      'company.crea': context.company?.crea || null,
      
      'representative.name': context.representative?.name || null,
      'representative.cpf': context.representative?.cpf || null,
      'representative.role': context.representative?.role || 'Sócio Administrador / Representante Legal',
      
      'technicalManager.name': context.technicalManager?.name || null,
      'technicalManager.crea': context.technicalManager?.crea || null,

      'opportunity.number': context.opportunity?.number || null,
      'opportunity.object': context.opportunity?.object || context.opportunity?.title || null,
      'contractingOrganization.name': context.opportunity?.client || context.opportunity?.organization || null,
      
      'currentDate': context.currentDate || new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    };

    let rendered = templateText;

    // Substituir tags no formato {{varName}}
    const regex = /\{\{([a-zA-Z0-9._]+)\}\}/g;
    rendered = rendered.replace(regex, (match, varName) => {
      const val = variableMap[varName];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        return String(val);
      }
      
      // Se não existir, gera placeholder controlado e marca como missing
      const friendlyPlaceholder = `[INFORMAR ${varName.toUpperCase().replace('.', ' ')}]`;
      missingVariables.push({
        variable: varName,
        placeholder: friendlyPlaceholder
      });
      return friendlyPlaceholder;
    });

    return {
      text: rendered,
      missingVariables,
      isComplete: missingVariables.length === 0
    };
  }

  static getTemplateById(id) {
    return documentTemplates.find(t => t.id === id) || null;
  }

  static listTemplates(category = null) {
    if (!category) return documentTemplates;
    return documentTemplates.filter(t => t.category === category);
  }
}
