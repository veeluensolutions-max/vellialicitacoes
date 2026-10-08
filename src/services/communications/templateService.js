/**
 * VELLIA LICITAÇÕES — FASE 18
 * templateService.js
 * Biblioteca de Modelos Inteligentes de Comunicação e Parser de Variáveis.
 */

import { CommunicationChannel, MessageType, ToneStyle } from './communicationModels.js';

const STORAGE_KEY_TEMPLATES = 'vellia_communication_templates_v18';

export const INITIAL_TEMPLATES = [
  // 1. E-mail Institucional — Excelência Ambiental
  {
    id: 'TPL-EMAIL-EXCELENCIA-01',
    name: 'Apresentação Institucional — Excelência Ambiental (Saneamento & ETE)',
    company: 'Excelência Ambiental',
    channel: CommunicationChannel.EMAIL,
    type: MessageType.APRESENTACAO_INSTITUCIONAL,
    service: 'Tratamento de Efluentes e Operação de ETE',
    tone: ToneStyle.EXECUTIVO,
    subject: 'Apresentação Institucional e Capacidade Técnica em O&M Ambiental — {{empresa}}',
    body: `Prezado(a) {{nome}},

Espero que este contato o(a) encontre bem.

Meu nome é {{responsavel}}, da Excelência Ambiental. Acompanhamos a atuação de excelência da {{empresa}} e identificamos sinergia técnica na área de saneamento industrial e gestão ambiental.

A Excelência Ambiental possui mais de uma década de experiência em operação contínua 24/7 de Estações de Tratamento de Efluentes (ETEs industriais e sanitárias), dispondo de acervo técnico registrado no CREA-PE com mais de 10 milhões de m³ tratados e corpo de engenheiros residentes dedicados.

Gostaríamos de colocar nossa equipe à disposição para apresentar nosso portfólio de casos de sucesso e credenciais técnicas em {{servico}}.

Poderíamos agendar uma breve conversa técnica de 15 minutos na próxima semana?

Atenciosamente,

{{responsavel}}
Excelência Ambiental
Gestão & Engenharia Ambiental Especializada`,
    status: 'ATIVO',
    createdAt: '2026-02-01T10:00:00Z'
  },

  // 2. E-mail de Follow-up Pós-Reunião — Veeluen Solutions
  {
    id: 'TPL-EMAIL-VEELUEN-02',
    name: 'Pós-Reunião Técnica e Envio de Acervo — Veeluen Solutions',
    company: 'Veeluen Solutions',
    channel: CommunicationChannel.EMAIL,
    type: MessageType.POS_REUNIAO,
    service: 'Inspeção e Conformidade NR-13',
    tone: ToneStyle.CONSULTIVO,
    subject: 'Resumo da Reunião Técnica e Disponibilização de Acervo — {{empresa}}',
    body: `Olá, {{nome}}.

Agradeço imensamente o tempo dedicado à nossa reunião sobre as demandas técnicas da {{empresa}}.

Conforme alinhamos, estou encaminhando o resumo das soluções discutidas e nosso acervo de Certidões de Acervo Técnico (CATs) para {{servico}}, incluindo métodos de ensaios não destrutivos e emissão de laudos digitais de integridade.

Permanecemos à inteira disposição para apoiar os estudos preliminares e esclarecer quaisquer dúvidas técnicas.

Um abraço,

{{responsavel}}
Veeluen Solutions`,
    status: 'ATIVO',
    createdAt: '2026-02-15T14:30:00Z'
  },

  // 3. WhatsApp Curto — Follow-up Pré-Edital / Planejamento
  {
    id: 'TPL-WAPP-PREEDITAL-03',
    name: 'WhatsApp — Contato Preventivo Objetivo (PCA / Pré-Edital)',
    company: 'Excelência Ambiental',
    channel: CommunicationChannel.WHATSAPP,
    type: MessageType.CONTATO_PRE_EDITAL,
    service: 'Monitoramento de Emissões Atmosféricas',
    tone: ToneStyle.OBJETIVO,
    subject: 'Contato WhatsApp — Alinhamento Técnico',
    body: `Olá, {{nome}}, tudo bem? Aqui é {{responsavel}} da Excelência Ambiental. Passando para confirmar se você recebeu nosso portfólio técnico de {{servico}}. Ficamos à disposição caso sua equipe precise de parâmetros de calibração para consultas mercadológicas. Um ótimo dia!`,
    status: 'ATIVO',
    createdAt: '2026-03-01T09:00:00Z'
  },

  // 4. LinkedIn — Conexão Profissional Consultiva
  {
    id: 'TPL-LINKEDIN-04',
    name: 'LinkedIn — Conexão Executiva Consultiva',
    company: 'Veeluen Solutions',
    channel: CommunicationChannel.LINKEDIN,
    type: MessageType.PRIMEIRO_CONTATO,
    service: 'Consultoria e Engenharia',
    tone: ToneStyle.CONSULTIVO,
    subject: 'Mensagem de Conexão LinkedIn',
    body: `Olá, {{nome}}. Acompanho os projetos e desafios de infraestrutura da {{empresa}}. Atuo na Veeluen Solutions com soluções em engenharia e conformidade técnica para {{servico}}. Gostaria de conectar e acompanhar suas publicações aqui na rede!`,
    status: 'ATIVO',
    createdAt: '2026-03-10T11:00:00Z'
  },

  // 5. E-mail — Envio de Portfólio Atualizado
  {
    id: 'TPL-EMAIL-PORTFOLIO-05',
    name: 'Envio de Portfólio Atualizado e Catálogo Técnico',
    company: 'Excelência Ambiental',
    channel: CommunicationChannel.EMAIL,
    type: MessageType.ENVIO_PORTFOLIO,
    service: 'Gestão e Destinação de Resíduos Perigosos',
    tone: ToneStyle.FORMAL,
    subject: 'Apresentação de Credenciais Técnicas em {{servico}} — {{empresa}}',
    body: `Prezado(a) {{nome}},

Em atenção ao relacionamento institucional com a {{empresa}}, tenho a honra de disponibilizar nosso Catálogo Técnico e Portfólio Corporativo atualizado para serviços de {{servico}}.

Dispomos de infraestrutura homologada perante os órgãos de controle ambiental (CPRH e IBAMA) com rastreamento integral de manifestos MTR e processos certificados.

O documento detalhado encontra-se disponível para consulta de sua equipe técnica.

Cordialmente,

{{responsavel}}`,
    status: 'ATIVO',
    createdAt: '2026-03-20T16:00:00Z'
  }
];

class TemplateService {
  constructor() {
    this._ensureInitialized();
  }

  _safeGetStorage(key) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.warn(`[TemplateService] Erro ao ler ${key}:`, e);
      }
    }
    return null;
  }

  _safeSetStorage(key, val) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {
        console.warn(`[TemplateService] Erro ao gravar ${key}:`, e);
      }
    }
  }

  _ensureInitialized() {
    const existing = this._safeGetStorage(STORAGE_KEY_TEMPLATES);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      this._safeSetStorage(STORAGE_KEY_TEMPLATES, INITIAL_TEMPLATES);
    }
  }

  getAllTemplates() {
    return this._safeGetStorage(STORAGE_KEY_TEMPLATES) || INITIAL_TEMPLATES;
  }

  getTemplatesByChannel(channel) {
    const all = this.getAllTemplates();
    if (!channel) return all;
    return all.filter(t => t.channel === channel);
  }

  getTemplateById(id) {
    const all = this.getAllTemplates();
    return all.find(t => t.id === id) || null;
  }

  /**
   * Substitui variáveis {{nome}}, {{empresa}}, {{servico}}, {{responsavel}}, {{oportunidade}}
   * e identifica variáveis não preenchidas (Item 45 e 46).
   */
  parseTemplate(templateText = '', variables = {}) {
    const missingVariables = [];
    const varKeys = ['nome', 'empresa', 'servico', 'responsavel', 'oportunidade'];

    let parsed = templateText;

    varKeys.forEach(k => {
      const regex = new RegExp(`{{\\s*${k}\\s*}}`, 'gi');
      if (regex.test(parsed)) {
        const val = variables[k];
        if (val && String(val).trim().length > 0) {
          parsed = parsed.replace(regex, String(val).trim());
        } else {
          missingVariables.push(k);
          // Não substitui para que fique visível no preview
        }
      }
    });

    return {
      parsedText: parsed,
      hasMissingVariables: missingVariables.length > 0,
      missingVariables
    };
  }

  addTemplate(data = {}) {
    const all = this.getAllTemplates();
    const newTpl = {
      id: data.id || `TPL-${Date.now()}`,
      name: data.name || 'Novo Modelo de Comunicação',
      company: data.company || 'Excelência Ambiental',
      channel: data.channel || CommunicationChannel.EMAIL,
      type: data.type || MessageType.PRIMEIRO_CONTATO,
      service: data.service || 'Serviços de Engenharia',
      tone: data.tone || ToneStyle.EXECUTIVO,
      subject: data.subject || 'Assunto da Mensagem',
      body: data.body || '',
      status: 'ATIVO',
      createdAt: new Date().toISOString()
    };

    all.push(newTpl);
    this._safeSetStorage(STORAGE_KEY_TEMPLATES, all);
    return newTpl;
  }
}

export const templateService = new TemplateService();
