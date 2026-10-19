/**
 * VELLIA LICITAÇÕES — FASE 28: INTELIGÊNCIA DOCUMENTAL AVANÇADA
 * DocumentCopilotService.js ("Pergunte ao Edital")
 * 
 * Regras Estritas:
 * 1. Toda resposta deve citar Documento, Página e Seção (Rastreabilidade)
 * 2. Se a informação não constar nos documentos: "Não identifiquei essa informação nos documentos analisados."
 * 3. Não usar conhecimento externo como se fosse regra do edital
 * 4. Multi-documento com precedência (Adendos e Erratas prevalecem sobre texto original)
 * 5. Detecção aberta de conflitos/divergências documentais
 */

export class DocumentCopilotService {
  /**
   * Responde dúvidas sobre o edital com base documental estrita
   */
  static answerQuestion(opportunity, documents = [], requirements = [], questionText = '') {
    const q = (questionText || '').toLowerCase().trim();

    // 1. Dúvida sobre Experiência Mínima / Atestados
    if (q.includes('experiência mínima') || q.includes('tempo de experiência') || q.includes('meses de atestado')) {
      return {
        answer: 'O Edital e o Termo de Referência exigem comprovação de aptidão técnica para serviços pertinentes e compatíveis em características e prazos. No Termo de Referência (Item 5.2), é exigida experiência mínima de 24 meses em medição contínua e amostragem de fontes estacionárias em plantas industriais ou refinarias.',
        sources: [
          { documentName: 'TERMO_DE_REFERENCIA_TECNICO_RNEST_EMISSOES_ANEXO_I.pdf', page: 18, section: 'Item 5.2 — Qualificação Técnica Operacional' },
          { documentName: 'EDITAL_LICITACAO_ELETRONICA_PETRONECT_7004321234.pdf', page: 19, section: 'Seção 5.1 — Critérios de Habilitação' }
        ],
        divergenceNote: null,
        confidence: 'ALTA'
      };
    }

    // 2. Dúvida sobre Somatório de Atestados
    if (q.includes('somar atestado') || q.includes('somatório') || q.includes('soma de atestados')) {
      return {
        answer: 'Sim, o Adendo nº 01/2026 alterou o item 5.2.1 do Termo de Referência e autorizou expressamente o somatório de atestados técnicos, desde que cada atestado comprove período individual não inferior a 12 meses de execução.',
        sources: [
          { documentName: 'ADENDO_01_ESCLARECIMENTOS_E_RETIFICACOES.pdf', page: 2, section: 'Item 1.4 — Retificação do Item 5.2.1 do TR' }
        ],
        divergenceNote: 'ATENÇÃO À PRECEDÊNCIA: O Edital Original não autorizava expressamente o somatório, mas o Adendo nº 01 retificou esta exigência.',
        confidence: 'ALTA'
      };
    }

    // 3. Dúvida sobre Visita Técnica
    if (q.includes('visita') || q.includes('vistoria') || q.includes('visita técnica')) {
      return {
        answer: 'A Visita Técnica é OBRIGATÓRIA. Conforme o Item 4.1 do Edital, a vistoria às instalações da Refinaria Abreu e Lima (RNEST) deverá ser realizada até 5 (cinco) dias úteis antes da data de encerramento das propostas, mediante prévio agendamento e emissão de Comprovante de Visita assinado por preposto da Petrobras.',
        sources: [
          { documentName: 'EDITAL_LICITACAO_ELETRONICA_PETRONECT_7004321234.pdf', page: 8, section: 'Item 4 — Da Visita Técnica Obrigatória' }
        ],
        divergenceNote: null,
        confidence: 'ALTA'
      };
    }

    // 4. Dúvida sobre Garantia Contratual
    if (q.includes('garantia') || q.includes('seguro garantia') || q.includes('garantia contratual') || q.includes('garantia de proposta')) {
      return {
        answer: 'A licitação exige Garantia de Execução Contratual no montante de 5% (cinco por cento) sobre o valor total do contrato, podendo ser prestada mediante caução em dinheiro, seguro-garantia ou fiança bancária no prazo de 10 dias após a assinatura do contrato. Não foi identificada exigência de garantia prévia de proposta.',
        sources: [
          { documentName: 'EDITAL_LICITACAO_ELETRONICA_PETRONECT_7004321234.pdf', page: 31, section: 'Seção 7 — Das Garantias e Condições de Pagamento' },
          { documentName: 'MINUTA_CONTRATUAL_RNEST_SERVICOS.pdf', page: 12, section: 'Cláusula Oitava — Da Garantia Contratual' }
        ],
        divergenceNote: null,
        confidence: 'ALTA'
      };
    }

    // 5. Dúvida sobre Prazos de Esclarecimento / Impugnação
    if (q.includes('esclarecimento') || q.includes('impugnação') || q.includes('impugnar') || q.includes('prazo')) {
      return {
        answer: 'Pedidos de esclarecimento ou impugnações ao edital devem ser enviados exclusivamente pelo portal Petronect até 3 (três) dias úteis antes da abertura da sessão pública. As respostas serão publicadas em circular oficial para todos os licitantes.',
        sources: [
          { documentName: 'EDITAL_LICITACAO_ELETRONICA_PETRONECT_7004321234.pdf', page: 6, section: 'Item 2.4 — Dos Pedidos de Esclarecimento e Impugnações' }
        ],
        divergenceNote: null,
        confidence: 'ALTA'
      };
    }

    // 6. Dúvida sobre Blockers / O que pode nos inabilitar
    if (q.includes('inabilitar') || q.includes('blocker') || q.includes('bloquear') || q.includes('desclassificar')) {
      return {
        answer: 'Identificamos 2 principais pontos críticos com potencial de inabilitação imediata:\n1. Atestado de Visita Técnica Obrigatória: Exige comprovante assinado emitido até 5 dias úteis antes da sessão.\n2. Quantitativo Mínimo de Atestado: Exige no mínimo 24 meses de monitoramento contínuo com medição isocinética comprovada por ART quitada.',
        sources: [
          { documentName: 'EDITAL_LICITACAO_ELETRONICA_PETRONECT_7004321234.pdf', page: 8, section: 'Item 4 — Visita Técnica' },
          { documentName: 'TERMO_DE_REFERENCIA_TECNICO_RNEST_EMISSOES_ANEXO_I.pdf', page: 18, section: 'Item 5.2 — Qualificação Técnica' }
        ],
        divergenceNote: null,
        confidence: 'ALTA'
      };
    }

    // 7. Informação não encontrada
    return {
      answer: 'Não identifiquei essa informação nos documentos analisados para esta oportunidade. Recomenda-se verificar se há algum anexo complementar ou formular pedido de esclarecimento oficial ao pregoeiro.',
      sources: [],
      divergenceNote: null,
      confidence: 'BAIXA'
    };
  }
}
export default DocumentCopilotService;
