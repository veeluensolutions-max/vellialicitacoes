/**
 * VELLIA LICITAÇÕES — FASE 18
 * messageGeneratorService.js
 * Motor de Redação Assistida com Contexto Real, Guardrails Anti-Exposição e Next Best Message.
 */

import {
  CommunicationChannel,
  MessageType,
  ToneStyle,
  MessageLength,
  CallToAction
} from './communicationModels.js';

class MessageGeneratorService {
  /**
   * Determina a Próxima Melhor Mensagem (Next Best Message - Itens 31 e 32)
   */
  suggestNextBestMessage(contact = {}, interactions = [], portfolios = []) {
    // 1. Verificação de Opt-out / Do Not Contact (Item 25 e 26, 73)
    if (contact.doNotContact) {
      return {
        isBlocked: true,
        blockReason: contact.doNotContactReason || 'Contato marcou opt-out / Não contatar.',
        suggestedType: null,
        suggestedChannel: null,
        explanation: 'Este contato está com bloqueio comercial ativo. O sistema proíbe sugestões de novas mensagens.'
      };
    }

    const totalInteractions = interactions.length;
    const hasPortfolioSent = portfolios.some(p => p.contactName === contact.name || p.organizationId === contact.organizationId);
    const hasMeeting = interactions.some(i => i.type === 'Reunião' || i.type === 'Videoconferência' || i.type === 'Visita');

    // Regra 1: Reunião realizada recentemente -> Pós-Reunião (Item 32)
    if (hasMeeting) {
      return {
        isBlocked: false,
        suggestedType: MessageType.POS_REUNIAO,
        suggestedChannel: CommunicationChannel.EMAIL,
        suggestedTone: ToneStyle.CONSULTIVO,
        suggestedCta: CallToAction.AGENDAR_CONVERSA,
        explanation: 'Reunião prévia identificada no CRM: Enviar resumo de pontos tratados e catálogo de CATs.'
      };
    }

    // Regra 2: Portfólio já enviado -> Follow-up objetivo (Item 32)
    if (hasPortfolioSent) {
      return {
        isBlocked: false,
        suggestedType: MessageType.FOLLOW_UP,
        suggestedChannel: CommunicationChannel.WHATSAPP,
        suggestedTone: ToneStyle.OBJETIVO,
        suggestedCta: CallToAction.SOLICITAR_RETORNO,
        explanation: 'Portfólio já encaminhado anteriormente: Realizar follow-up curto para verificar recebimento e dúvidas.'
      };
    }

    // Regra 3: Nunca abordado antes -> Apresentação institucional consultiva (Item 32 e 72)
    if (totalInteractions === 0) {
      return {
        isBlocked: false,
        suggestedType: MessageType.PRIMEIRO_CONTATO,
        suggestedChannel: CommunicationChannel.EMAIL,
        suggestedTone: ToneStyle.EXECUTIVO,
        suggestedCta: CallToAction.APRESENTAR_SERVICO,
        explanation: 'Contato novo sem histórico prévio: Apresentação institucional enxuta e foco em atestados técnicos.'
      };
    }

    // Regra 4: Já abordado -> Retomada de contato
    return {
      isBlocked: false,
      suggestedType: MessageType.RETOMADA_CONTATO,
      suggestedChannel: CommunicationChannel.EMAIL,
      suggestedTone: ToneStyle.CONSULTIVO,
      suggestedCta: CallToAction.SOLICITAR_REUNIAO,
      explanation: 'Contato existente: Retomar relacionamento com base no histórico do órgão.'
    };
  }

  /**
   * Redige mensagem assistida com IA / Heurística Contextual avançada (Itens 5 a 15)
   * Aplica estritamente Guardrails de Comunicação (Itens 6, 58, 59, 61, 62, 74)
   */
  generateAssistedMessage({
    channel = CommunicationChannel.EMAIL,
    type = MessageType.PRIMEIRO_CONTATO,
    tone = ToneStyle.EXECUTIVO,
    length = MessageLength.MEDIO,
    cta = CallToAction.SOLICITAR_REUNIAO,
    contact = {},
    organization = {},
    service = 'Tratamento de Efluentes e Operação de ETE',
    company = 'Excelência Ambiental',
    responsible = 'Roberto Mendes (Diretor Comercial)',
    interactions = [],
    hasRelatedTenderOrSignal = false
  }) {
    // 1. Guardrail de Bloqueio Opt-out (Item 25 e 26, 73)
    if (contact.doNotContact) {
      throw new Error(`BLOQUEIO DE SEGURANÇA: Contato ${contact.name} está marcado como "Não contatar" (${contact.doNotContactReason || 'Sem motivo informado'}).`);
    }

    const contactName = contact.name || 'Gestor(a)';
    const contactPosition = contact.position || 'Responsável Técnico';
    const orgName = organization.name || 'sua organização';
    const hasPreviousInteraction = interactions && interactions.length > 0;
    const warnings = [];

    // 2. Guardrail de Não Inventar Contexto (Item 6): Se não há histórico, nunca usar expressões de reencontro
    let greeting = '';
    if (channel === CommunicationChannel.WHATSAPP) {
      greeting = `Olá, ${contactName.split(' ')[0]}, tudo bem? Aqui é ${responsible.split(' ')[0]} da ${company}.`;
    } else if (channel === CommunicationChannel.LINKEDIN) {
      greeting = `Olá, ${contactName.split(' ')[0]}, espero que esteja bem!`;
    } else {
      greeting = tone === ToneStyle.FORMAL ? `Prezado(a) ${contactName},` : `Olá, ${contactName},`;
    }

    // 3. Guardrail de Uso do Radar Antecipado (Item 61 e 62): Transformar sinal interno em abordagem natural
    let contextParagraph = '';
    if (hasPreviousInteraction) {
      contextParagraph = `Em atenção ao nosso relacionamento institucional com a ${orgName}, gostaria de dar continuidade ao nosso contato sobre soluções em ${service}.`;
    } else if (hasRelatedTenderOrSignal) {
      warnings.push('Alerta de Contexto: Oportunidade interna/preditiva vinculada. A mensagem foi redigida de forma natural sem expor sistemas de monitoramento interno.');
      contextParagraph = `Acompanhamos a relevância das operações da ${orgName} e gostaríamos de apresentar nossa capacidade técnica e acervo homologado para futuras demandas em ${service}.`;
    } else {
      contextParagraph = `Acompanhamos a atuação da ${orgName} e identificamos excelente sinergia com as soluções de engenharia e sustentabilidade desenvolvidas pela ${company}.`;
    }

    // 4. Proposta de Valor
    let valueParagraph = '';
    if (channel === CommunicationChannel.WHATSAPP) {
      valueParagraph = `Temos ampla experiência e equipe própria para ${service}, com acervo de projetos similares em Pernambuco e no Nordeste.`;
    } else if (channel === CommunicationChannel.LINKEDIN) {
      valueParagraph = `Atuo na ${company} e acompanho os desafios de infraestrutura e gestão técnica da ${orgName}. Será um prazer compartilhar experiências em ${service}.`;
    } else {
      valueParagraph = `A ${company} dispõe de acervo técnico registrado no CREA com atestados de capacidade técnica comprovada para ${service}, contando com equipe de engenheiros residentes e equipamentos de alta precisão.`;
    }

    // 5. Chamada para Ação (CTA)
    let ctaParagraph = '';
    if (channel === CommunicationChannel.WHATSAPP) {
      ctaParagraph = 'Teria 10 minutos nesta semana para trocarmos uma ideia sobre como podemos apoiar sua equipe?';
    } else if (channel === CommunicationChannel.LINKEDIN) {
      ctaParagraph = 'Gostaria de conectar e ficar à disposição para futuras conversas sobre o setor!';
    } else {
      if (cta === CallToAction.SOLICITAR_REUNIAO) {
        ctaParagraph = 'Gostaríamos de agendar uma breve conversa técnica de 15 minutos na próxima semana para apresentar nossas credenciais sem qualquer compromisso.';
      } else if (cta === CallToAction.ENVIAR_PORTFOLIO) {
        ctaParagraph = 'Colocamo-nos à disposição para encaminhar nosso Catálogo de Atestados Técnicos e apresentação executiva para apreciação de sua gerência.';
      } else {
        ctaParagraph = 'Ficamos à inteira disposição para apoiar sua equipe técnica em consultas mercadológicas e estudos de referência.';
      }
    }

    // 6. Fechamento e Assinatura
    let signOff = '';
    if (channel === CommunicationChannel.WHATSAPP) {
      signOff = 'Um abraço e boa semana!';
    } else if (channel === CommunicationChannel.LINKEDIN) {
      signOff = 'Atenciosamente,';
    } else {
      signOff = `Atenciosamente,\n\n${responsible}\n${company}`;
    }

    // 7. Montagem do Assunto (Subject)
    let subject = '';
    if (type === MessageType.PRIMEIRO_CONTATO || type === MessageType.APRESENTACAO_INSTITUCIONAL) {
      subject = `Apresentação Técnica e Credenciais em ${service} — ${orgName}`;
    } else if (type === MessageType.FOLLOW_UP) {
      subject = `Follow-up Técnico: Soluções em ${service} — ${orgName}`;
    } else if (type === MessageType.POS_REUNIAO) {
      subject = `Agradecimento e Resumo da Reunião Técnica — ${orgName}`;
    } else {
      subject = `Alinhamento Institucional: ${company} & ${orgName}`;
    }

    // 8. Montagem do Corpo Final
    let body = '';
    if (channel === CommunicationChannel.WHATSAPP) {
      body = `${greeting} ${contextParagraph} ${valueParagraph} ${ctaParagraph} ${signOff}`;
    } else if (channel === CommunicationChannel.LINKEDIN) {
      body = `${greeting}\n\n${contextParagraph}\n\n${valueParagraph}\n\n${ctaParagraph}\n\n${signOff}\n${responsible}`;
    } else {
      body = `${greeting}\n\n${contextParagraph}\n\n${valueParagraph}\n\n${ctaParagraph}\n\n${signOff}`;
    }

    // 9. Guardrail de Privacidade Rigoroso (Item 58, 59 e 74):
    // Assegura que nenhum termo confidencial de inteligência interna apareça no texto gerado
    const forbiddenPatterns = [
      /\bdecision score\b/i,
      /\brisk score\b/i,
      /\bmargem líquida\b/i,
      /\bmargem bruta\b/i,
      /\bcusto interno\b/i,
      /\bnosso sistema prevê\b/i,
      /\bsabemos que seu contrato\b/i
    ];

    forbiddenPatterns.forEach(pattern => {
      if (pattern.test(body)) {
        body = body.replace(pattern, '[termo confidencial removido]');
        warnings.push('Guardrail Ativado: Termo confidencial interno foi expurgado da mensagem externa.');
      }
    });

    return {
      channel,
      type,
      subject,
      body,
      warnings,
      guardrailsPassed: true,
      generatedAt: new Date().toISOString()
    };
  }
}

export const messageGeneratorService = new MessageGeneratorService();
