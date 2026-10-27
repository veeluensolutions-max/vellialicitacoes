/**
 * VELLIA LICITAÇÕES — GERADOR INTELIGENTE DE IMPUGNAÇÕES E PEDIDOS DE ESCLARECIMENTO
 * Especializado em Direito Administrativo, Lei Federal nº 14.133/2021, Lei nº 13.303/2016 e Súmulas do TCU.
 * 
 * Atua para as empresas consorciadas:
 * 1. VEELUEN SOLUTIONS LTDA (Engenharia, Automação, Instrumentação, Sistemas)
 * 2. EXCELÊNCIA AMBIENTAL LTDA (Consultoria, Monitoramento Contínuo, Amostragem e Licenciamento)
 */

import { AiModelProviderService } from '../ai/aiModelProviderService.js';
import { logService, LogType } from '../logService.js';

export const PIECE_TYPES = {
  IMPUGNACAO: 'IMPUGNACAO',
  ESCLARECIMENTO: 'ESCLARECIMENTO',
  RECURSO: 'RECURSO'
};

export const LEGAL_GROUNDS_CATALOG = [
  {
    id: 'vedacao_somatorio_atestados',
    title: 'Vedação Ilegal de Somatório de Atestados Técnicos',
    category: 'Qualificação Técnica',
    severity: 'CRÍTICA',
    summary: 'O edital proíbe indevidamente o somatório de atestados de capacidade técnica para comprovação de quantitativos ou prazos.',
    articles: 'Art. 67, § 1º da Lei 14.133/2021; Súmula TCU nº 263; Acórdãos 1.214/2013-Plenário e 2.158/2020-Plenário',
    tcuSumula: 'Súmula TCU nº 263: "Para a comprovação da capacidade técnico-operacional das licitantes, (...) deve ser admitida a apresentação de atestados relativos a parcelas similares, bem como o somatório de atestados para a comprovação de quantitativos."',
    argumentation: `A vedação ao somatório de atestados de aptidão técnica viola frontalmente o princípio da competitividade e o art. 67 da Lei 14.133/2021. Conforme jurisprudência pacífica do Tribunal de Contas da União, a proibição de somatório somente se justifica quando a especificidade técnica do objeto demonstrar inequivocamente que a capacidade não pode ser fracionada, ônus argumentativo que compete exclusivamente à Administração e que inexiste no presente caso.`
  },
  {
    id: 'visita_tecnica_obrigatoria',
    title: 'Exigência Abusiva de Visita Técnica Obrigatória',
    category: 'Restrição de Competitividade',
    severity: 'ALTA',
    summary: 'Exigência de vistoria prévia presencial obrigatória como condição de habilitação ou sob pena de desclassificação.',
    articles: 'Art. 67, § 2º e § 3º da Lei 14.133/2021; Súmula TCU nº 272; Acórdão 2.829/2015-TCU-Plenário',
    tcuSumula: 'Súmula TCU nº 272: "No edital de licitação, é vedada a fixação de exigência de visita técnica obrigatória quando a avaliação das condições locais puder ser substituída por declaração formal do licitante."',
    argumentation: `A imposição de visita técnica obrigatória impõe custo desnecessário e restringe a ampla participação de empresas sediadas em outras localidades. A nova Lei de Licitações (art. 67, § 3º) estabelece que a visita técnica deve ser prioritariamente facultativa, sendo conferido ao licitante o direito de optar pela apresentação de declaração formal de pleno conhecimento das condições locais de execução.`
  },
  {
    id: 'quantitativo_minimo_excessivo',
    title: 'Quantitativos Mínimos Excessivos em Atestados (> 50%)',
    category: 'Qualificação Técnica',
    severity: 'CRÍTICA',
    summary: 'Exigência de atestados que comprovem parcelas superiores a 50% do volume total a ser contratado.',
    articles: 'Art. 67, § 2º da Lei 14.133/2021; Acórdão 1.891/2006-TCU-Plenário; Acórdão 1.214/2013-TCU-Plenário',
    tcuSumula: 'Acórdão 1.214/2013-TCU-Plenário: "A fixação de quantitativos mínimos em patamares superiores a 50% do objeto a ser contratado configura restrição desarrazoada ao caráter competitivo do certame."',
    argumentation: `A Administração Pública não pode exigir quantitativos mínimos desarrazoados para comprovação de capacidade técnico-operacional. O limite prudencial consagrado pelo TCU e pela doutrina fixa o teto de 50% dos quantitativos dos itens de maior relevância, sob pena de violação ao art. 37, XXI da CF/88.`
  },
  {
    id: 'vinculo_previo_equipe',
    title: 'Exigência Ilegal de Vínculo Empregatício Prévio da Equipe',
    category: 'Habilitação Profissional',
    severity: 'MÉDIA',
    summary: 'Exigência de que os responsáveis técnicos ou equipe pertençam previamente ao quadro de funcionários da empresa na data da proposta.',
    articles: 'Súmula TCU nº 272; Acórdãos 1.442/2013-Plenário e 1.944/2014-Plenário',
    tcuSumula: 'Súmula TCU nº 272 (parte 2): "É suficiente a apresentação de contrato de prestação de serviços ou declaração de compromisso de vinculação futura caso a empresa venha a ser contratada."',
    argumentation: `A exigência de que os profissionais detenham vínculo empregatício formal prévio antes da adjudicação do contrato impõe ônus financeiro descabido aos concorrentes antes mesmo de saberem se sagrarão vencedores, configurando exigência restritiva censurada pelo TCU.`
  },
  {
    id: 'prazo_exiguo_propostas',
    title: 'Prazo Exíguo e Inobservância de Prazos Mínimos de Publicidade',
    category: 'Procedimento e Prazos',
    severity: 'ALTA',
    summary: 'Intervalo inferior aos dias úteis legais entre a publicação do edital e a data de abertura da sessão de lances.',
    articles: 'Art. 55 da Lei 14.133/2021; Art. 39 da Lei 13.303/2016',
    tcuSumula: 'Acórdão 2.314/2017-TCU-Plenário: "A inobservância dos prazos legais de publicidade acarreta nulidade absoluta da sessão de abertura."',
    argumentation: `A complexidade do escopo contratual demanda tempo hábil para precificação diligente, cotações de insumos e montagem de propostas de engenharia e monitoramento ambiental. O desrespeito ao prazo mínimo legal contamina o certame de nulidade insanável.`
  },
  {
    id: 'restricao_geografica_atestado',
    title: 'Restrição Territorial ou Geográfica para Aceitação de Atestados',
    category: 'Qualificação Técnica',
    severity: 'CRÍTICA',
    summary: 'Cláusula exigindo que os atestados tenham sido executados no mesmo estado, município ou bacia hidrográfica do órgão.',
    articles: 'Art. 67, § 5º da Lei 14.133/2021; Acórdão 1.838/2018-TCU-Plenário',
    tcuSumula: 'Art. 67, § 5º: "Não serão admitidas exigências de atestados com limitações de tempo, época ou relativas a locais específicos."',
    argumentation: `A Lei Federal nº 14.133/2021 veda expressamente a imposição de limites geográficos ou temporais na aceitação de atestados de capacidade técnica. A expertise técnica em engenharia ou monitoramento industrial independe da localidade territorial em que foi originariamente prestada.`
  }
];

export const COMPANIES_DATA = {
  VEELUEN: {
    razaoSocial: 'VEELUEN SOLUTIONS LTDA',
    cnpj: '45.123.890/0001-44',
    endereco: 'Av. Engenheiro Domingos Ferreira, 2160, Boa Viagem, Recife - PE, CEP 51111-020',
    email: 'licitacoes@veeluen.com',
    telefone: '(81) 3040-5500',
    representante: 'Diretoria de Contratos e Licitações',
    qualificacao: 'sociedade empresária especializada em engenharia, automação, telemetria e integração de sistemas'
  },
  EXCELENCIA: {
    razaoSocial: 'EXCELÊNCIA AMBIENTAL ENGENHARIA E CONSULTORIA LTDA',
    cnpj: '38.987.654/0001-22',
    endereco: 'Rua da Aurora, 1025, Santo Amaro, Recife - PE, CEP 50050-000',
    email: 'juridico@excelenciaambiental.com.br',
    telefone: '(81) 3222-7788',
    representante: 'Diretoria Técnica e Jurídica',
    qualificacao: 'sociedade empresária especializada em consultoria ambiental, monitoramento contínuo de emissões (CEMS) e amostragem isocinética'
  }
};

export class ImpugnationGeneratorService {
  /**
   * Identifica vícios potenciais a partir dos dados do certame e requisitos
   */
  static detectPotentialFlaws(opportunity, requirements = []) {
    const detected = [];
    const textCorpus = [
      opportunity?.title || '',
      opportunity?.object || '',
      opportunity?.description || '',
      ...(requirements.map(r => `${r.title || ''} ${r.description || ''} ${r.observation || ''}`))
    ].join(' ').toLowerCase();

    for (const ground of LEGAL_GROUNDS_CATALOG) {
      if (ground.id === 'vedacao_somatorio_atestados') {
        if (textCorpus.includes('vedado o somatório') || textCorpus.includes('vedada a soma de atestados') || textCorpus.includes('não será admitido o somatório') || textCorpus.includes('único atestado')) {
          detected.push(ground);
        }
      } else if (ground.id === 'visita_tecnica_obrigatoria') {
        if (textCorpus.includes('visita técnica obrigatória') || textCorpus.includes('vistoria obrigatória') || textCorpus.includes('sob pena de inabilitação a não realização da visita')) {
          detected.push(ground);
        }
      } else if (ground.id === 'quantitativo_minimo_excessivo') {
        if (textCorpus.includes('70%') || textCorpus.includes('80%') || textCorpus.includes('100% da quantidade') || textCorpus.includes('quantitativo idêntico')) {
          detected.push(ground);
        }
      } else if (ground.id === 'vinculo_previo_equipe') {
        if (textCorpus.includes('quadro permanente') || textCorpus.includes('carteira de trabalho registrada') || textCorpus.includes('vínculo empregatício prévio')) {
          detected.push(ground);
        }
      } else if (ground.id === 'restricao_geografica_atestado') {
        if (textCorpus.includes('executados no estado de') || textCorpus.includes('mesmo município') || textCorpus.includes('raio de')) {
          detected.push(ground);
        }
      }
    }

    // Se nenhum detectado explicitamente por regex, retorna as duas teses mais frequentes como recomendação
    if (detected.length === 0) {
      return [LEGAL_GROUNDS_CATALOG[0], LEGAL_GROUNDS_CATALOG[1]];
    }

    return detected;
  }

  /**
   * Gera a petição jurídica estruturada completa
   */
  static generatePiece({
    pieceType = PIECE_TYPES.IMPUGNACAO,
    companyKey = 'VEELUEN',
    opportunity,
    selectedGroundIds = [],
    customFacts = '',
    specificClause = 'Cláusula do Edital / Termo de Referência'
  }) {
    const company = companyKey === 'EXCELENCIA' ? COMPANIES_DATA.EXCELENCIA : COMPANIES_DATA.VEELUEN;
    const certameNum = opportunity?.number || opportunity?.id || '7004321234';
    const orgao = opportunity?.client || 'PETRÓLEO BRASILEIRO S.A. - PETROBRAS / ÓRGÃO LICITANTE';
    const objeto = opportunity?.object || opportunity?.title || 'Contratação de Serviços Especializados de Engenharia e Monitoramento';
    const modalidade = opportunity?.modality || 'Pregão Eletrônico';
    const portal = opportunity?.portal || 'Petronect / Compras.gov.br';

    const selectedGrounds = LEGAL_GROUNDS_CATALOG.filter(g => selectedGroundIds.includes(g.id));
    const activeGrounds = selectedGrounds.length > 0 ? selectedGrounds : [LEGAL_GROUNDS_CATALOG[0]];

    const isPetro = (portal || '').toLowerCase().includes('petronect') || (orgao || '').toLowerCase().includes('petrobras');
    const legalRegime = isPetro 
      ? 'Lei Federal nº 13.303/2016 (Estatuto das Estatais) e Regulamento de Licitações e Contratos da Petrobras (RLPC)' 
      : 'Lei Federal nº 14.133/2021 (Nova Lei de Licitações e Contratos Administrativos)';

    const pieceTitle = pieceType === PIECE_TYPES.IMPUGNACAO
      ? 'IMPUGNAÇÃO AOS TERMOS DO EDITAL'
      : pieceType === PIECE_TYPES.ESCLARECIMENTO
      ? 'PEDIDO FORMAL DE ESCLARECIMENTO EDITALÍCIO'
      : 'RECURSO ADMINISTRATIVO HIERÁRQUICO';

    const prazoArtigo = isPetro 
      ? 'art. 39 da Lei nº 13.303/2016 e disposições do RLPC' 
      : pieceType === PIECE_TYPES.IMPUGNACAO
      ? 'art. 164 da Lei Federal nº 14.133/2021'
      : 'art. 165 da Lei Federal nº 14.133/2021';

    let pieceText = `ILUSTRÍSSIMO(A) SENHOR(A) PREGOEIRO(A) / AGENTE DE CONTRATAÇÃO / COMISSÃO DE LICITAÇÃO
${orgao.toUpperCase()}

Referência:
Processo Licitatório nº: ${certameNum}
Modalidade: ${modalidade}
Objeto: ${objeto}
Portal de Disputa: ${portal}


${company.razaoSocial}, pessoa jurídica de direito privado, inscrita no CNPJ/MF sob o nº ${company.cnpj}, com sede em ${company.endereco}, endereço eletrônico institucional ${company.email}, ${company.qualificacao}, por intermédio de seus representantes legais, vem, respeitosamente, perante Vossa Senhoria, com fulcro no ${prazoArtigo}, na Constituição da República Federativa do Brasil de 1988 (art. 37, XXI) e na jurisprudência consolidada do Tribunal de Contas da União (TCU), apresentar a presente:

${pieceTitle}

em face do instrumento convocatório que rege a licitação em epígrafe, consubstanciada nos fatos e fundamentos jurídicos a seguir delineados.

------------------------------------------------------------------------------------------------------------------------
I. DA TEMPESTIVIDADE E DA LEGITIMIDADE ATIVA
------------------------------------------------------------------------------------------------------------------------
Ab initio, cumpre destacar que a presente petição é tempestiva. Consoante o regime jurídico aplicável (${legalRegime}), qualquer pessoa física ou jurídica é parte legítima para impugnar edital de licitação por irregularidade na aplicação da lei, protocolando a petição até 3 (três) dias úteis antes da data de abertura do certame.

Portanto, protocolizada dentro do interregno legal prescrito, restam plenamente atendidos os requisitos de admissibilidade, legitimidade e interesse processual.

------------------------------------------------------------------------------------------------------------------------
II. DA SÍNTESE DO OBJETO E DOS FATOS
------------------------------------------------------------------------------------------------------------------------
Trata-se de certame licitatório promovido com vistas à contratação de "${objeto}".

Ocorre que, ao analisar detalhadamente o instrumento convocatório e seus respectivos anexos técnicos, constatou-se a inclusão de disposições restritivas que violam os primados da isonomia, da legalidade, da proporcionalidade e da ampla competitividade que devem nortear as compras públicas.

Especificamente no tocante ao item ${specificClause}, a Administração incorreu em exigência excessiva, a saber:
${customFacts.trim() ? `"${customFacts.trim()}"` : `Imposição de cláusulas desarrazoadas e desprovidas de respaldo legal que impedem a participação de concorrentes plenamente aptos à execução contratual.`}

Passa-se, pois, aos fundamentos de direito que amparam a retificação do ato convocatório.

------------------------------------------------------------------------------------------------------------------------
III. DOS FUNDAMENTOS JURÍDICOS E DA JURISPRUDÊNCIA DO TRIBUNAL DE CONTAS DA UNIÃO
------------------------------------------------------------------------------------------------------------------------
`;

    // Incorporação das Teses Selecionadas com Jurisprudência
    activeGrounds.forEach((ground, idx) => {
      pieceText += `
III.${idx + 1}. ${ground.title.toUpperCase()}
Fundamento Normativo: ${ground.articles}

${ground.argumentation}

Nesse exato sentido se posiciona a pacífica jurisprudência da Corte de Contas Federal:

"${ground.tcuSumula}"

Com efeito, a exigência combatida afronta o art. 37, XXI da Carta Magna, o qual dispõe que o processo licitatório somente permitirá exigências de qualificação técnica e econômica indispensáveis à garantia do cumprimento das obrigações, vedando qualquer cláusula que frustre ou restrinja o caráter competitivo da disputa.
`;
    });

    pieceText += `
------------------------------------------------------------------------------------------------------------------------
IV. DOS PEDIDOS E REQUERIMENTOS FINAIS
------------------------------------------------------------------------------------------------------------------------
Ex positis, demonstrada a inadequação das exigências editalícias em confronto com a ordem jurídica pátria e a jurisprudência dominante do Tribunal de Contas da União, requer-se:

a) O RECEBIMENTO da presente ${pieceTitle}, porquanto tempestiva, legítima e cabível;

b) No mérito, o seu TOTAL ACOLHIMENTO E PROCEDÊNCIA para que seja RETIFICADO o instrumento convocatório, expurgando-se a irregularidade apontada, adequando-se a redação do Edital e do Termo de Referência aos ditames da Lei e dos entendimentos consolidados do TCU;

c) Caso a retificação afete a formulação das propostas, seja determinada a REABERTURA INTEGRAL DO PRAZO LEGAL de publicidade, nos termos do art. 55, § 1º da Lei nº 14.133/2021 (ou normas do RLPC);

d) Subsidiariamente, caso não seja acolhida de plano, a SUSPENSÃO CAUTELAR do certame até julgamento definitivo da controvérsia pela autoridade competente, prevenindo prejuízos irreparáveis ao erário e aos licitantes.

Nestes termos,
Pede e espera deferimento.

Recife/PE, ${new Date().toLocaleDateString('pt-BR')}.

____________________________________________________________
${company.razaoSocial}
${company.representante}
CNPJ: ${company.cnpj}
`;

    return {
      title: pieceTitle,
      company,
      content: pieceText,
      groundsUsed: activeGrounds,
      isAiEnhanced: false
    };
  }

  /**
   * Enriquecimento da petição através de IA Generativa em Nuvem (Google Gemini ou OpenAI)
   */
  static async generatePieceWithAI({
    pieceType,
    companyKey,
    opportunity,
    selectedGroundIds,
    customFacts,
    specificClause
  }) {
    // 1. Gera a base estruturada
    const basePiece = this.generatePiece({
      pieceType,
      companyKey,
      opportunity,
      selectedGroundIds,
      customFacts,
      specificClause
    });

    // 2. Se IA não configurada, retorna base jurídica estrita
    if (!AiModelProviderService.isConfigured()) {
      return basePiece;
    }

    try {
      const config = AiModelProviderService.getConfig();
      const prompt = `Você é um renomado advogado especialista em Direito Administrativo, Licitações Públicas (Lei 14.133/2021 e Lei 13.303/2016) e sustentação perante o TCU.
Revise, aprimore e formate em alto rigor jurídico formal a petição abaixo.
Mantenha a qualificação da empresa impugnante, a estrutura formal (Preâmbulo, Tempestividade, Dos Fatos, Do Direito com jurisprudência do TCU e Pedidos) e enriqueça a fundamentação jurídica de modo persuasivo, elegante e contundente.

Certame: ${opportunity?.number || ''} - ${opportunity?.client || ''}
Objeto: ${opportunity?.object || opportunity?.title || ''}
Portal: ${opportunity?.portal || ''}

MINUTA BASE PARA ENRIQUECER:
${basePiece.content}

Instruções:
- Devolva o texto da petição integral formatado, pronto para protocolo em tribunal administrativo.
- Não inclua explicações ou introduções fora do texto da petição.`;

      let aiEnhancedText = '';

      if (config.provider === 'GEMINI') {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey.trim()}`;
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.15,
              maxOutputTokens: 3500
            }
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          aiEnhancedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } else if (config.provider === 'OPENAI') {
        const endpoint = 'https://api.openai.com/v1/chat/completions';
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.openaiApiKey.trim()}`
          },
          body: JSON.stringify({
            model: config.openaiModel,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.15,
            max_tokens: 3500
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          aiEnhancedText = data.choices?.[0]?.message?.content || '';
        }
      }

      if (aiEnhancedText && aiEnhancedText.trim().length > 200) {
        logService.addLog(LogType.AUDIT, `IA Jurídica: Minuta de ${basePiece.title} redigida com sucesso via ${config.provider}.`);
        return {
          ...basePiece,
          content: aiEnhancedText.trim(),
          isAiEnhanced: true,
          aiModel: config.provider === 'GEMINI' ? config.geminiModel : config.openaiModel
        };
      }
    } catch (e) {
      console.warn('[ImpugnationGeneratorService] Falha na IA, usando minuta heurística robusta:', e);
    }

    return basePiece;
  }
}

export default ImpugnationGeneratorService;
