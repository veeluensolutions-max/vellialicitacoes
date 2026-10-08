/**
 * VELLIA LICITAÇÕES - COMPANY CERTIFICATES REPOSITORY (FASE 8)
 * Banco de atestados de capacidade técnica, registros e certidões das empresas cadastradas
 * (Excelência Ambiental e Veeluen Solutions) para comparação automática com requisitos de editais.
 */

export const initialCompanyCertificates = {
  'excelencia-ambiental': {
    companyId: 'excelencia-ambiental',
    companyName: 'Excelência Ambiental',
    creaRegistro: 'CREA-PE nº 042891/D',
    creaStatus: 'Ativo e Regular',
    responsavelTecnico: 'Dr. Roberto Albuquerque (Engenheiro Químico e de Segurança do Trabalho - CREA-PE 038192)',
    certidoes: {
      federal: { nome: 'Certidão Conjunta Federal (Tributos e Dívida Ativa)', validade: '18/12/2026', status: 'VÁLIDA' },
      estadual: { nome: 'Certidão Negativa de Débitos Estaduais (SEFAZ-PE)', validade: '25/11/2026', status: 'VÁLIDA' },
      municipal: { nome: 'Certidão Negativa de Tributos Municipais (Recife)', validade: '10/01/2027', status: 'VÁLIDA' },
      fgts: { nome: 'Certificado de Regularidade do FGTS (CRF)', validade: '30/10/2026', status: 'VÁLIDA' },
      trabalhista: { nome: 'Certidão Negativa de Débitos Trabalhistas (CNDT)', validade: '15/10/2026', status: 'VENCE EM 8 DIAS' }
    },
    atestados: [
      {
        id: 'atest-ea-01',
        cliente: 'Petrobras - Refinaria Abreu e Lima (RNEST)',
        servico: 'Monitoramento contínuo de emissões atmosféricas em fontes estacionárias e chaminés de processo',
        periodoMeses: 36,
        dataEmissao: '15/03/2025',
        volume: 'Mais de 120 campanhas de amostragem isocinética de MP, SOx, NOx e CO',
        normas: ['ABNT NBR 10701', 'ABNT NBR 11966', 'CONAMA 382/2006', 'CONAMA 436/2011'],
        responsavelTecnico: 'Dr. Roberto Albuquerque',
        artNumero: 'ART-PE-2024-0098231',
        equipamentosUtilizados: ['Amostrador Isocinético de Chaminé com Sonda Aquecida', 'Analisador de Gases Testo 350', 'Tubo Pitot Tipo S'],
        scoreBase: 96
      },
      {
        id: 'atest-ea-02',
        cliente: 'Braskem S.A. - Polo Cloroquímico de Alagoas',
        servico: 'Medição de emissões atmosféricas fugitivas e dutos industriais com elaboração de relatórios técnicos',
        periodoMeses: 24,
        dataEmissao: '10/08/2024',
        volume: '48 campanhas trimestrais completas',
        normas: ['CONAMA 382', 'Métodos EPA 1, 2, 3, 4 e 5'],
        responsavelTecnico: 'Dr. Roberto Albuquerque',
        artNumero: 'ART-AL-2023-0044122',
        equipamentosUtilizados: ['Trem de Amostragem Isocinética', 'Cromatógrafo Gasoso Portátil'],
        scoreBase: 88
      },
      {
        id: 'atest-ea-03',
        cliente: 'Comperj / Gaslub Itaboraí - Petrobras',
        servico: 'Modelagem de dispersão atmosférica (AERMOD) e inventário de fontes fixas para licenciamento ambiental',
        periodoMeses: 18,
        dataEmissao: '05/11/2025',
        volume: 'Modelagem de 32 fontes estacionárias e caldeiras auxiliares',
        normas: ['Diretrizes CPRH', 'EPA AERMOD Modeling System'],
        responsavelTecnico: 'Dr. Roberto Albuquerque',
        artNumero: 'ART-RJ-2025-0102931',
        equipamentosUtilizados: ['Estação Meteorológica Integrada', 'Software BREEZE AERMOD Professional'],
        scoreBase: 82
      }
    ],
    equipeDisponivel: [
      { nome: 'Dr. Roberto Albuquerque', funcao: 'Engenheiro Químico / Responsável Técnico', qualificacao: 'Doutorado / CREA Ativo', experienciaAnos: 16, registro: 'CREA-PE' },
      { nome: 'Juliana Cavalcanti', funcao: 'Engenheira Ambiental Pleno', qualificacao: 'Pós-graduação em Gestão de Emissões', experienciaAnos: 7, registro: 'CREA-PE' },
      { nome: 'Marcos Vinícius Prado', funcao: 'Técnico de Coleta e Amostragem Isocinética', qualificacao: 'Técnico em Química / NR-33 / NR-35', experienciaAnos: 6, registro: 'CRQ-I' }
    ],
    equipamentosDisponiveis: [
      { nome: 'Amostrador Isocinético de Chaminé Completo', modelo: 'Apex Instruments / C-5000', calibracaoValida: 'Válida até 12/2026', certificadoInmetro: true },
      { nome: 'Analisador Eletrônico de Gases de Combustão', modelo: 'Testo 350 Flue Gas Analyzer', calibracaoValida: 'Válida até 10/2026', certificadoInmetro: true },
      { nome: 'Tubo Pitot Tipo S Calibrado', modelo: 'Apex Pitot 3m', calibracaoValida: 'Válida até 02/2027', certificadoInmetro: true },
      { nome: 'Barômetro e Termômetro Digital de Precisão', modelo: 'Instrutherm BT-400', calibracaoValida: 'Válida até 08/2027', certificadoInmetro: true }
    ]
  },
  'veeluen-solutions': {
    companyId: 'veeluen-solutions',
    companyName: 'Veeluen Solutions',
    creaRegistro: 'CREA-PE nº 058190/D',
    creaStatus: 'Ativo e Regular',
    responsavelTecnico: 'Eng. Marcelo Antunes (Engenheiro Mecânico e Sanitário - CREA-PE 049210)',
    certidoes: {
      federal: { nome: 'Certidão Conjunta Federal', validade: '20/12/2026', status: 'VÁLIDA' },
      estadual: { nome: 'Certidão Negativa SEFAZ-PE', validade: '15/11/2026', status: 'VÁLIDA' },
      municipal: { nome: 'Certidão Negativa Cabo de Santo Agostinho', validade: '05/02/2027', status: 'VÁLIDA' },
      fgts: { nome: 'Certificado de Regularidade do FGTS', validade: '22/10/2026', status: 'VÁLIDA' },
      trabalhista: { nome: 'Certidão Negativa Trabalhista (CNDT)', validade: '28/11/2026', status: 'VÁLIDA' }
    },
    atestados: [
      {
        id: 'atest-vs-01',
        cliente: 'Transpetro - Terminal Aquaviário de Suape',
        servico: 'Operação, controle operacional e manutenção contínua de Estação de Tratamento de Efluentes Industriais e Sanitários (ETE/ETDI)',
        periodoMeses: 36,
        dataEmissao: '22/01/2025',
        volume: 'Tratamento de vazão média de 180 m³/dia com descarte conforme padrão CPRH',
        normas: ['Resolução CONAMA 430/2011', 'Normas ABNT ETE'],
        responsavelTecnico: 'Eng. Marcelo Antunes',
        artNumero: 'ART-PE-2023-0081290',
        equipamentosUtilizados: ['Bombas Centrífugas e Submersíveis', 'Decantadores', 'Filtros Prensa de Lodo'],
        scoreBase: 95
      },
      {
        id: 'atest-vs-02',
        cliente: 'Petrobras - Refinaria Abreu e Lima (RNEST)',
        servico: 'Inspeção periódica de segurança, ensaios não destrutivos (ultrassom) e teste hidrostático em Caldeiras e Vasos de Pressão (NR-13)',
        periodoMeses: 24,
        dataEmissao: '18/06/2025',
        volume: 'Mais de 140 vasos de pressão e 4 caldeiras aquatubulares inspecionados',
        normas: ['NR-13 do MTE', 'Código ASME Seção VIII Div. 1'],
        responsavelTecnico: 'Eng. Marcelo Antunes',
        artNumero: 'ART-PE-2024-0077123',
        equipamentosUtilizados: ['Aparelho de Medição de Espessura por Ultrassom Krautkramer', 'Bomba de Teste Hidrostático'],
        scoreBase: 92
      }
    ],
    equipeDisponivel: [
      { nome: 'Eng. Marcelo Antunes', funcao: 'Engenheiro Mecânico e de Segurança (RT)', qualificacao: 'Especialista em NR-13 e Saneamento', experienciaAnos: 14, registro: 'CREA-PE' },
      { nome: 'Carla Beatriz Menezes', funcao: 'Química Industrial / Operadora Chefe ETE', qualificacao: 'Bacharelado em Química / CRQ Ativo', experienciaAnos: 8, registro: 'CRQ-I' },
      { nome: 'Danilo Siqueira', funcao: 'Técnico em Eletromecânica / Manutenção', qualificacao: 'Técnico CFT / NR-10 / NR-33', experienciaAnos: 6, registro: 'CFT-PE' }
    ],
    equipamentosDisponiveis: [
      { nome: 'Medidor de Espessura por Ultrassom Calibrado', modelo: 'Olympus 38DL Plus', calibracaoValida: 'Válida até 01/2027', certificadoInmetro: true },
      { nome: 'Bomba de Pressurização Hidrostática Portátil', modelo: 'Ridgid 1450', calibracaoValida: 'Válida até 11/2026', certificadoInmetro: true },
      { nome: 'Oxímetro e Medidor Multiparâmetro Portátil para ETE', modelo: 'YSI ProSolo Digital', calibracaoValida: 'Válida até 12/2026', certificadoInmetro: true }
    ]
  }
};

export class CompanyCertificatesRepository {
  static getByCompanyId(companyId) {
    const key = String(companyId).toLowerCase().includes('excelencia') ? 'excelencia-ambiental' : 'veeluen-solutions';
    return initialCompanyCertificates[key];
  }

  static getByName(companyName) {
    if (String(companyName).toLowerCase().includes('excelência') || String(companyName).toLowerCase().includes('excelencia')) {
      return initialCompanyCertificates['excelencia-ambiental'];
    }
    return initialCompanyCertificates['veeluen-solutions'];
  }
}
