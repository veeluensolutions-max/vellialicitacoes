/**
 * VELLIA LICITAÇÕES - MOTOR DE ADERÊNCIA INTELIGENTE (FASE 4)
 * Núcleo semântico para interpretação contextual e classificação de oportunidades de licitações.
 */

import { contextualMatchingEngine } from './intelligence/contextualMatchingEngine.js';

// Catálogo estruturado de serviços e empresas da Família Vellia
export const SERVICE_CATALOG = [
  // --- EXCELÊNCIA AMBIENTAL ---
  {
    id: 'ea-emissoes-atmosfericas',
    name: 'Monitoramento de Emissões Atmosféricas',
    company: 'Excelência Ambiental',
    category: 'Qualidade do Ar & Emissões',
    priority: 'Alta', // Prioridade Comercial Estratégica
    strategicWeight: 10,
    technicalDescription: 'Medição contínua e pontual de gases poluentes e compostos em fontes estacionárias, dutos e chaminés industriais.',
    keywords: ['emissões atmosféricas', 'fontes estacionárias', 'efluentes gasosos', 'chaminés industriais', 'gases de combustão', 'medição de emissões', 'monitoramento contínuo', 'poluentes atmosféricos', 'gases da combustão', 'dutos de exaustão', 'amostragem em duto'],
    synonyms: ['caracterização de efluentes gasosos', 'análise de gases industriais', 'monitoramento de chaminé', 'medição de poluentes gasosos', 'exaustão industrial', 'controle de emissões de poluentes'],
    editalPhrases: [
      'monitoramento de fontes estacionárias',
      'caracterização de efluentes gasosos',
      'medição de emissão atmosférica',
      'amostragem em chaminés e dutos',
      'controle de qualidade de emissões'
    ]
  },
  {
    id: 'ea-amostragem-isocinetica',
    name: 'Amostragem Isocinética',
    company: 'Excelência Ambiental',
    category: 'Qualidade do Ar & Emissões',
    priority: 'Alta',
    strategicWeight: 10,
    technicalDescription: 'Coleta de material particulado e gases em velocidade idêntica ao fluxo do duto, segundo EPA Method 5 e ABNT NBR 12019/12020.',
    keywords: ['amostragem isocinética', 'material particulado', 'particulados totais', 'EPA 5', 'coleta isocinética', 'sonda isocinética', 'duto industrial', 'NBR 12019', 'NBR 12020', 'isocinetismo'],
    synonyms: ['coleta em fluxo isocinético', 'medição de particulados em chaminé', 'amostragem em fluxo constante', 'teste isocinético de chaminé'],
    editalPhrases: [
      'amostragem isocinética em chaminés',
      'determinação de material particulado em fontes estacionárias',
      'coleta isocinética de poluentes atmosféricos'
    ]
  },
  {
    id: 'ea-inventario-emissoes',
    name: 'Inventário de Emissões Atmosféricas',
    company: 'Excelência Ambiental',
    category: 'Consultoria e Gestão de Carbono',
    priority: 'Média',
    strategicWeight: 8,
    technicalDescription: 'Quantificação e mapeamento de fontes pontuais, fugitivas e móveis com fatores de emissão AP-42 e GHG Protocol.',
    keywords: ['inventário de emissões', 'balanço de emissões', 'fontes móveis e fixas', 'fatores de emissão', 'AP-42', 'GHG Protocol', 'pegada de carbono', 'gases de efeito estufa', 'GEE'],
    synonyms: ['quantificação de emissões', 'relatório de emissões de GEE', 'mapeamento de fontes de poluição'],
    editalPhrases: [
      'elaboração de inventário de emissões atmosféricas',
      'quantificação de fontes de emissão de poluentes'
    ]
  },
  {
    id: 'ea-modelagem-dispersao',
    name: 'Modelagem de Dispersão Atmosférica',
    company: 'Excelência Ambiental',
    category: 'Estudos Ambientais Especializados',
    priority: 'Alta',
    strategicWeight: 9,
    technicalDescription: 'Simulação computacional da trajetória e diluição de plumas de poluentes no ar atmosférico.',
    keywords: ['modelagem de dispersão', 'pluma de poluição', 'impacto na qualidade do ar', 'simulação atmosférica', 'dispersão de poluentes', 'difusão de gases'],
    synonyms: ['modelo de dispersão gasosa', 'estudo de pluma atmosférica', 'simulação computacional de poluentes'],
    editalPhrases: [
      'modelagem matemática de dispersão de poluentes',
      'estudo de dispersão atmosférica'
    ]
  },
  {
    id: 'ea-aermod',
    name: 'AERMOD',
    company: 'Excelência Ambiental',
    category: 'Modelagem Matemática Avançada',
    priority: 'Alta',
    strategicWeight: 9,
    technicalDescription: 'Simulação regulatória com o modelo EPA AERMOD, acoplado com processador meteorológico AERMET e terreno AERMAP.',
    keywords: ['AERMOD', 'AERMET', 'AERMAP', 'calpuff', 'dados meteorológicos', 'rosa dos ventos', 'topografia digital', 'modelo regulatório EPA'],
    synonyms: ['software aermod', 'modelagem matemática regulatória', 'simulação aermod'],
    editalPhrases: [
      'estudos de dispersão utilizando o modelo AERMOD',
      'simulação através do software AERMOD'
    ]
  },
  {
    id: 'ea-qualidade-ar',
    name: 'Qualidade do Ar',
    company: 'Excelência Ambiental',
    category: 'Monitoramento Ambiental',
    priority: 'Alta',
    strategicWeight: 9,
    technicalDescription: 'Instalação e operação de estações de monitoramento de ar ambiente, medindo PTS, PM10, PM2.5, SO2, NOx e Ozônio conforme Resolução CONAMA 491.',
    keywords: ['qualidade do ar', 'estação de monitoramento', 'ar ambiente', 'PTS', 'PM10', 'PM2.5', 'ozônio', 'NOx', 'SO2', 'CONAMA 491', 'partículas inaláveis'],
    synonyms: ['monitoramento do ar atmosférico', 'avaliação da qualidade do ar ambiente', 'amostragem de ar ambiente'],
    editalPhrases: [
      'monitoramento da qualidade do ar ambiente',
      'operação de estações de qualidade do ar'
    ]
  },
  {
    id: 'ea-monitoramento-ambiental',
    name: 'Monitoramento Ambiental',
    company: 'Excelência Ambiental',
    category: 'Monitoramento Ambiental',
    priority: 'Média',
    strategicWeight: 8,
    technicalDescription: 'Campanhas periódicas de fiscalização e conformidade com condicionantes de Licenças Ambientais (LP, LI, LO).',
    keywords: ['monitoramento ambiental', 'indicadores ambientais', 'relatório de conformidade', 'condicionantes ambientais', 'licença de operação'],
    synonyms: ['acompanhamento ambiental', 'campanha ambiental periódica', 'gestão de conformidade ambiental'],
    editalPhrases: ['prestação de serviços de monitoramento ambiental contínuo']
  },
  {
    id: 'ea-ruido-ambiental',
    name: 'Ruído Ambiental',
    company: 'Excelência Ambiental',
    category: 'Acústica & Vibração',
    priority: 'Média',
    strategicWeight: 7,
    technicalDescription: 'Medição e laudos de níveis de pressão sonora em áreas habitadas e limites de propriedade segundo NBR 10151.',
    keywords: ['ruído ambiental', 'pressão sonora', 'nível de pressão sonora', 'NBR 10151', 'impacto acústico vizinhança', 'sonômetro', 'laudo acústico'],
    synonyms: ['poluição sonora ambiental', 'avaliação de ruído para comunidades', 'laudo de ruído externo'],
    editalPhrases: [
      'avaliação de ruído ambiental em conformidade com NBR 10151',
      'medição de níveis de pressão sonora'
    ]
  },
  {
    id: 'ea-ruido-ocupacional',
    name: 'Ruído Ocupacional',
    company: 'Excelência Ambiental',
    category: 'Acústica & Higiene Ocupacional',
    priority: 'Média',
    strategicWeight: 7,
    technicalDescription: 'Dosimetria e avaliação do nível de exposição normalizado (NEN) conforme NHO 01 da Fundacentro e NR-15.',
    keywords: ['ruído ocupacional', 'dosimetria', 'NHO 01', 'nível de exposição', 'dose de ruído', 'audiodosímetro', 'NR-15'],
    synonyms: ['medição de ruído no ambiente de trabalho', 'avaliação de ruído ocupacional contínuo'],
    editalPhrases: ['dosimetria de ruído ocupacional e laudo de exposição']
  },
  {
    id: 'ea-avaliacao-odor',
    name: 'Avaliação de Odor',
    company: 'Excelência Ambiental',
    category: 'Qualidade do Ar & Emissões',
    priority: 'Média',
    strategicWeight: 7,
    technicalDescription: 'Medições olfatométricas e avaliação de incômodo olfativo por unidades de odor (ouE/m3) e modelagem de dispersão de odores.',
    keywords: ['olfatometria', 'odor', 'compostos odoríferos', 'taxa de emissão de odor', 'incômodo olfativo', 'unidade de odor'],
    synonyms: ['percepção olfativa', 'avaliação olfatométrica', 'monitoramento de odores industriais'],
    editalPhrases: ['monitoramento e avaliação de odores e compostos voláteis']
  },
  {
    id: 'ea-consultoria-ambiental',
    name: 'Consultoria Ambiental',
    company: 'Excelência Ambiental',
    category: 'Consultoria Estratégica',
    priority: 'Média',
    strategicWeight: 7,
    technicalDescription: 'Assessoria para licenciamento ambiental, estudos EIA/RIMA, PCA, RCA e atendimento aos órgãos ambientais (CPRH, IBAMA, INEA, CETESB).',
    keywords: ['consultoria ambiental', 'licenciamento', 'RIMA', 'EIA', 'renovação de LO', 'PCA', 'RCA', 'órgão ambiental', 'CPRH', 'IBAMA'],
    synonyms: ['assessoria ambiental', 'estudos de impacto ambiental', 'regularização ambiental'],
    editalPhrases: ['serviços de consultoria e suporte ao licenciamento ambiental']
  },

  // --- VEELUEN SOLUTIONS ---
  {
    id: 'vs-operacao-ete',
    name: 'Operação de ETE',
    company: 'Veeluen Solutions',
    category: 'Saneamento & Operação Industrial',
    priority: 'Alta',
    strategicWeight: 10,
    technicalDescription: 'Operação contínua de Estações de Tratamento de Esgoto e Efluentes com dosagem química, controle de lodo e análises laboratoriais.',
    keywords: ['operação de ETE', 'estação de tratamento de esgoto', 'esgoto sanitário', 'efluentes sanitários', 'tratamento biológico', 'lodos ativados', 'descarte de efluente', 'operador de ETE', 'ETDI', 'sistema de tratamento de esgoto'],
    synonyms: ['gestão operacional de ETE', 'condução operacional de sistema de tratamento de esgoto', 'acompanhamento de tratamento de esgoto sanitário', 'operação de estação de tratamento'],
    editalPhrases: [
      'operação do sistema de tratamento de esgoto sanitário',
      'acompanhamento e operação de ETE',
      'gestão e operação de estação de tratamento de esgoto',
      'prestação de serviços para operação de ETE'
    ]
  },
  {
    id: 'vs-manutencao-ete',
    name: 'Manutenção de ETE',
    company: 'Veeluen Solutions',
    category: 'Saneamento & Operação Industrial',
    priority: 'Alta',
    strategicWeight: 10,
    technicalDescription: 'Manutenção preventiva, preditiva e corretiva de equipamentos mecânicos e elétricos de ETE (bombas submersíveis, sopradores, difusores, raspadores).',
    keywords: ['manutenção de ETE', 'manutenção preventiva e corretiva do sistema de tratamento', 'bombas submersíveis', 'difusores de ar', 'sopradores', 'decantador', 'leito de secagem', 'manutenção eletromecânica de ETE', 'painéis de comando ETE'],
    synonyms: ['revisão de equipamentos de ETE', 'conserto de bombas de esgoto', 'conservação preventiva de estação de tratamento de esgoto', 'manutenção corretiva de sistema de esgoto'],
    editalPhrases: [
      'manutenção preventiva e corretiva do sistema de tratamento de esgoto sanitário',
      'manutenção eletromecânica de estação de tratamento de efluentes',
      'serviços de manutenção em ETE e elevatórias'
    ]
  },
  {
    id: 'vs-operacao-eta',
    name: 'Operação de ETA',
    company: 'Veeluen Solutions',
    category: 'Saneamento & Operação Industrial',
    priority: 'Alta',
    strategicWeight: 9,
    technicalDescription: 'Operação de Estações de Tratamento de Água potável e industrial com floculação, decantação, filtração, cloração e fluoretação.',
    keywords: ['operação de ETA', 'estação de tratamento de água', 'água potável', 'água de reúso', 'coagulação', 'floculação', 'filtração', 'potabilização', 'água industrial'],
    synonyms: ['gestão de estação de água', 'condução de ETA', 'tratamento de água para consumo'],
    editalPhrases: ['serviços de operação e controle de estação de tratamento de água']
  },
  {
    id: 'vs-tratamento-efluentes',
    name: 'Tratamento de Efluentes',
    company: 'Veeluen Solutions',
    category: 'Saneamento & Operação Industrial',
    priority: 'Alta',
    strategicWeight: 9,
    technicalDescription: 'Tratamento físico-químico e biológico de efluentes industriais com adequação aos parâmetros da Resolução CONAMA 430 para descarte ou reúso.',
    keywords: ['tratamento de efluentes', 'efluentes industriais', 'efluente líquido', 'DBO', 'DQO', 'padrão de lançamento', 'CONAMA 430', 'tratamento físico-químico', 'reúso de água'],
    synonyms: ['depuração de efluentes', 'adequação de despejos industriais', 'tratamento de águas residuárias'],
    editalPhrases: [
      'prestação de serviços de tratamento de efluentes',
      'adequação e tratamento de efluentes líquidos industriais'
    ]
  },
  {
    id: 'vs-nr13',
    name: 'NR-13',
    company: 'Veeluen Solutions',
    category: 'Engenharia Mecânica & Segurança',
    priority: 'Alta',
    strategicWeight: 10,
    technicalDescription: 'Gestão da integridade estrutural, relatórios de inspeção e reconstituição de prontuários com Profissional Habilitado (PH).',
    keywords: ['NR-13', 'norma regulamentadora 13', 'segurança de caldeiras e vasos', 'profissional habilitado', 'PH NR13', 'prontuário NR-13', 'livro de registro de segurança'],
    synonyms: ['adequação à norma NR 13', 'laudo técnico nr-13', 'conformidade NR-13 de equipamentos pressurizados'],
    editalPhrases: [
      'inspeção de segurança conforme NR-13',
      'atendimento aos requisitos da NR-13',
      'reconstituição de prontuário e laudo NR-13'
    ]
  },
  {
    id: 'vs-inspecao-caldeiras',
    name: 'Inspeção de Caldeiras',
    company: 'Veeluen Solutions',
    category: 'Engenharia Mecânica & Segurança',
    priority: 'Alta',
    strategicWeight: 9,
    technicalDescription: 'Inspeção de segurança inicial, periódica e extraordinária em caldeiras flamotubulares e aquotubulares com teste hidrostático e cálculo de PMTA.',
    keywords: ['inspeção de caldeiras', 'caldeira a vapor', 'caldeira flamotubular', 'caldeira aquotubular', 'teste hidrostático', 'espessura por ultrassom', 'PMTA', 'válvula de segurança'],
    synonyms: ['vistoria técnica em gerador de vapor', 'inspeção periódica de caldeira', 'ensaio não destrutivo em caldeira'],
    editalPhrases: [
      'inspeção de segurança periódica em caldeiras',
      'calibração de válvulas e inspeção de caldeiras'
    ]
  },
  {
    id: 'vs-inspecao-vasos-pressao',
    name: 'Inspeção de Vasos de Pressão',
    company: 'Veeluen Solutions',
    category: 'Engenharia Mecânica & Segurança',
    priority: 'Alta',
    strategicWeight: 10,
    technicalDescription: 'Inspeção visual interna/externa, medição de espessura por ultrassom e cálculo de vida residual em vasos pressurizados.',
    keywords: ['vasos de pressão', 'equipamentos pressurizados', 'reservatório de ar comprimido', 'autoclave', 'inspeção de integridade estrutural', 'tubulações sob pressão', 'ensaio ultrassônico', 'inspeção de segurança'],
    synonyms: ['inspeção de equipamentos pressurizados', 'avaliação de vasos sob pressão', 'inspeção técnica em reservatórios de pressão'],
    editalPhrases: [
      'inspeção de segurança em vasos de pressão e equipamentos pressurizados',
      'inspeção periódica em vasos de pressão',
      'ensaios e inspeção técnica de vasos sob pressão'
    ]
  },
  {
    id: 'vs-spda',
    name: 'SPDA',
    company: 'Veeluen Solutions',
    category: 'Engenharia Elétrica & Segurança',
    priority: 'Média',
    strategicWeight: 8,
    technicalDescription: 'Projetos, inspeções e laudos de Sistema de Proteção contra Descargas Atmosféricas conforme NBR 5419.',
    keywords: ['SPDA', 'pára-raios', 'aterramento', 'NBR 5419', 'medição ôhmica', 'laudo de SPDA', 'malha de aterramento', 'resistência de aterramento'],
    synonyms: ['proteção contra descargas atmosféricas', 'laudo de para-raios', 'medição de malha de aterramento'],
    editalPhrases: ['inspeção e laudo técnico de SPDA e malhas de aterramento']
  },
  {
    id: 'vs-sistemas-gases',
    name: 'Sistemas de Gases',
    company: 'Veeluen Solutions',
    category: 'Engenharia Mecânica & Tubulações',
    priority: 'Média',
    strategicWeight: 8,
    technicalDescription: 'Instalação, comissionamento e testes de estanqueidade em redes e centrais de gases combustíveis e especiais.',
    keywords: ['sistemas de gases', 'rede de gás', 'gás combustível', 'gás inerte', 'nitrogênio', 'oxigênio', 'estanqueidade', 'central de gases'],
    synonyms: ['tubulações de gases industriais', 'redes de distribuição de gás', 'teste de estanqueidade de rede de gás'],
    editalPhrases: ['instalação e manutenção de sistemas e tubulações de gases']
  },
  {
    id: 'vs-manutencao-industrial',
    name: 'Manutenção Industrial',
    company: 'Veeluen Solutions',
    category: 'Montagem & Manutenção Eletromecânica',
    priority: 'Alta',
    strategicWeight: 9,
    technicalDescription: 'Serviços integrados de mecânica, elétrica, instrumentação e caldeiraria em plantas industriais e refinarias.',
    keywords: ['manutenção industrial', 'eletromecânica', 'tubulações industriais', 'válvulas', 'caldeiraria', 'montagem mecânica', 'soldagem qualificada', 'parada de manutenção'],
    synonyms: ['serviços eletromecânicos industriais', 'manutenção em plantas de processo', 'apoio operacional à manutenção'],
    editalPhrases: ['prestação de serviços contínuos de manutenção industrial e eletromecânica']
  },
  {
    id: 'vs-obras-civis',
    name: 'Obras Civis',
    company: 'Veeluen Solutions',
    category: 'Construção & Infraestrutura',
    priority: 'Média',
    strategicWeight: 7,
    technicalDescription: 'Execução de obras civis industriais, fundações, bases de equipamentos, contenções e alvenarias.',
    keywords: ['obras civis', 'construção civil', 'base de concreto', 'pavimentação', 'reforma predial', 'drenagem', 'engenharia civil'],
    synonyms: ['construção industrial', 'reformas e edificações civis', 'intervenções civis'],
    editalPhrases: ['serviços de obras civis e reformas em instalações']
  },
  {
    id: 'vs-infraestrutura',
    name: 'Infraestrutura',
    company: 'Veeluen Solutions',
    category: 'Construção & Infraestrutura',
    priority: 'Média',
    strategicWeight: 7,
    technicalDescription: 'Projetos e execução de infraestrutura viária, redes enterradas de utilidades e terraplenagem.',
    keywords: ['infraestrutura', 'terraplenagem', 'galpões industriais', 'redes enterradas', 'urbanização', 'pavimentação asfáltica'],
    synonyms: ['obras de infraestrutura geral', 'estruturação de sítio industrial'],
    editalPhrases: ['execução de obras e melhorias de infraestrutura']
  },
  {
    id: 'vs-sst',
    name: 'SST',
    company: 'Veeluen Solutions',
    category: 'Segurança e Saúde no Trabalho',
    priority: 'Média',
    strategicWeight: 8,
    technicalDescription: 'Gestão integrada de Segurança e Saúde do Trabalho com equipe residente, treinamentos e auditorias.',
    keywords: ['SST', 'segurança e saúde no trabalho', 'gestão de segurança', 'técnico de segurança', 'engenheiro de segurança', 'APR', 'DDS', 'EPI'],
    synonyms: ['segurança ocupacional', 'assessoria de SST', 'prevenção de acidentes'],
    editalPhrases: ['serviços de assessoria e gestão em segurança e saúde do trabalho']
  },
  {
    id: 'vs-pgr',
    name: 'PGR',
    company: 'Veeluen Solutions',
    category: 'Segurança e Saúde no Trabalho',
    priority: 'Média',
    strategicWeight: 8,
    technicalDescription: 'Elaboração e manutenção do Programa de Gerenciamento de Riscos conforme NR-01 do MTE.',
    keywords: ['PGR', 'programa de gerenciamento de riscos', 'NR-01', 'matriz de riscos', 'inventário de riscos', 'plano de ação PGR'],
    synonyms: ['gerenciamento de riscos ocupacionais', 'laudo pgr', 'documento base pgr'],
    editalPhrases: ['elaboração e atualização do PGR']
  },
  {
    id: 'vs-ltcat',
    name: 'LTCAT',
    company: 'Veeluen Solutions',
    category: 'Higiene Ocupacional & Previdência',
    priority: 'Média',
    strategicWeight: 8,
    technicalDescription: 'Laudo Técnico das Condições Ambientais de Trabalho para cumprimento das exigências do INSS e eSocial.',
    keywords: ['LTCAT', 'laudo técnico das condições ambientais do trabalho', 'insalubridade', 'periculosidade', 'aposentadoria especial', 'eSocial S-2240'],
    synonyms: ['laudo previdenciário ambiental', 'avaliação de agentes nocivos ltc'],
    editalPhrases: ['elaboração de LTCAT e laudos de insalubridade/periculosidade']
  },
  {
    id: 'vs-gestao-residuos',
    name: 'Gestão de Resíduos',
    company: 'Veeluen Solutions',
    category: 'Saneamento & Gestão Ambiental',
    priority: 'Média',
    strategicWeight: 8,
    technicalDescription: 'Segregação, acondicionamento, transporte e destinação final ambientalmente adequada de resíduos Classe I e II.',
    keywords: ['gestão de resíduos', 'resíduos sólidos', 'coleta e transporte', 'destinação final', 'MTR', 'manifesto de transporte', 'coprocessamento', 'aterro sanitário'],
    synonyms: ['manejo de resíduos industriais', 'gerenciamento de descartes sólidos'],
    editalPhrases: ['prestação de serviços de gerenciamento e destinação de resíduos']
  },
  {
    id: 'vs-pgrs',
    name: 'PGRS',
    company: 'Veeluen Solutions',
    category: 'Saneamento & Gestão Ambiental',
    priority: 'Média',
    strategicWeight: 8,
    technicalDescription: 'Plano de Gerenciamento de Resíduos Sólidos em conformidade com a Lei Federal 12.305/2010 (PNRS).',
    keywords: ['PGRS', 'plano de gerenciamento de resíduos sólidos', 'PNRS', 'classe I', 'classe II', 'política nacional de resíduos'],
    synonyms: ['plano de resíduos industriais', 'documentação pgrs'],
    editalPhrases: ['elaboração e aprovação de PGRS']
  },
  {
    id: 'vs-energia-solar',
    name: 'Energia Solar',
    company: 'Veeluen Solutions',
    category: 'Energia Sustentável & Transição',
    priority: 'Alta',
    strategicWeight: 9,
    technicalDescription: 'Engenharia, suprimentos e construção (EPC) de usinas solares fotovoltaicas em solo e telhados industriais.',
    keywords: ['energia solar', 'sistema fotovoltaico', 'painéis solares', 'inversor', 'geração distribuída', 'usina solar', 'módulos fotovoltaicos'],
    synonyms: ['energia fotovoltaica', 'geração solar industrial', 'instalação solar'],
    editalPhrases: ['implantação de sistema de geração fotovoltaica solar']
  }
];

// Regiões de atuação primária das empresas (Base: Pernambuco/Nordeste e expansão nacional)
export const COMPANY_REGIONS = {
  'Excelência Ambiental': {
    primaryStates: ['PE', 'AL', 'PB', 'RN', 'CE', 'SE', 'BA'],
    secondaryStates: ['SP', 'RJ', 'MG', 'ES', 'PR', 'SC', 'RS'],
    headquarters: 'Recife - PE'
  },
  'Veeluen Solutions': {
    primaryStates: ['PE', 'AL', 'PB', 'BA', 'SE', 'CE', 'RN'],
    secondaryStates: ['SP', 'RJ', 'MG', 'ES', 'PR', 'RS'],
    headquarters: 'Cabo de Santo Agostinho - PE'
  }
};

/**
 * Função principal do Motor de Aderência (FASE 27: MOTOR CONTEXTUAL + INTELIGÊNCIA DE MATCHING)
 * Analisa o texto e parâmetros da oportunidade com pipeline cascade, intenção e vocabulário ponderado.
 */
export function analyzeOpportunityAdherence({
  title = '',
  object = '',
  description = '',
  location = 'PE',
  daysLeft = 15,
  estimatedValue = null,
  forcedPortal = 'Petronect'
} = {}) {
  const res = contextualMatchingEngine.analyze({
    title,
    object,
    description,
    location,
    daysLeft,
    estimatedValue,
    forcedPortal
  });

  if (!res.recommendedCompany || res.recommendedCompany === 'Empresa não definida') {
    const srvLower = (res.primaryServiceName || '').toLowerCase();
    const txtLower = `${title} ${object} ${description}`.toLowerCase();
    const isExcel =
      srvLower.includes('emiss') ||
      srvLower.includes('isocin') ||
      srvLower.includes('qualidade do ar') ||
      srvLower.includes('aermod') ||
      srvLower.includes('dispers') ||
      srvLower.includes('ruído') ||
      srvLower.includes('ruido') ||
      srvLower.includes('odor') ||
      srvLower.includes('monitoramento ambiental') ||
      srvLower.includes('licenciamento') ||
      srvLower.includes('consultoria ambiental') ||
      txtLower.includes('emissões atmosféricas') ||
      txtLower.includes('qualidade do ar') ||
      txtLower.includes('monitoramento ambiental') ||
      txtLower.includes('licenciamento ambiental') ||
      txtLower.includes('ruído ambiental');

    res.recommendedCompany = isExcel ? 'Excelência Ambiental' : 'Veeluen Solutions';
  }

  return res;
}

// Exemplos oficiais de demonstração semântica para o laboratório do usuário
export const DEMO_SEMANTIC_EXAMPLES = [
  {
    id: 'ex-1',
    label: 'Exemplo 1: Emissões Atmosféricas e Fontes Estacionárias',
    title: 'Monitoramento de fontes estacionárias e caracterização de efluentes gasosos',
    object: 'Prestação de serviços técnicos para monitoramento de fontes estacionárias e caracterização de efluentes gasosos com medição de poluentes atmosféricos em chaminés industriais.',
    location: 'Ipojuca - PE',
    daysLeft: 14,
    expectedCompany: 'Excelência Ambiental',
    expectedServices: ['Monitoramento de Emissões Atmosféricas', 'Amostragem Isocinética', 'Inventário de Emissões']
  },
  {
    id: 'ex-2',
    label: 'Exemplo 2: Operação e Manutenção de ETE',
    title: 'Operação e manutenção do sistema de tratamento de esgoto sanitário',
    object: 'Contratação de empresa especializada para operação, acompanhamento e manutenção preventiva e corretiva do sistema de tratamento de esgoto sanitário e efluentes.',
    location: 'Cabo de Santo Agostinho - PE',
    daysLeft: 18,
    expectedCompany: 'Veeluen Solutions',
    expectedServices: ['Operação de ETE', 'Manutenção de ETE', 'Tratamento de Efluentes']
  },
  {
    id: 'ex-3',
    label: 'Exemplo 3: Inspeção de Vasos de Pressão e NR-13',
    title: 'Inspeção de segurança em vasos de pressão e equipamentos pressurizados',
    object: 'Inspeção de segurança em vasos de pressão e equipamentos pressurizados com realização de ensaios não destrutivos e emissão de laudo técnico segundo NR-13.',
    location: 'Santos - SP',
    daysLeft: 12,
    expectedCompany: 'Veeluen Solutions',
    expectedServices: ['NR-13', 'Inspeção de Vasos de Pressão', 'Inspeção de Caldeiras']
  }
];
