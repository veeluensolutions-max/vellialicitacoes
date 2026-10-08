/**
 * VELLIA LICITAÇÕES — FASE 15: ARQUITETURA MULTIFONTE
 * pcaService.js: Gestão do Plano de Contratações Anual (PCA) & Radar Antecipado
 * 
 * Atende aos requisitos:
 * - Itens 38, 39, 40, 41: Monitoramento de compras planejadas antes da publicação de edital
 * - Item 41: Alerta suave e classificado como "Oportunidade potencial futura" (sem alarme crítico)
 */

import { RecordType } from './opportunityDTO.js';

export const MOCK_PCA_RECORDS = [
  {
    id: 'PCA-COMPESA-2027-01',
    recordType: RecordType.PLANNED_PURCHASE,
    portal: 'PNCP (PCA)',
    orgao: 'Companhia Pernambucana de Saneamento - COMPESA',
    titulo: 'Expansão e Adequação de ETEs no Polo Automotivo de Goiana',
    objetoPlanejado: 'Contratação futura de serviços integrados de engenharia sanitária e automação de ETE para atendimento ao plano plurianual de saneamento.',
    previsaoLicitacao: '1º Trimestre / 2027',
    valorEstimado: 'R$ 8.500.000,00',
    estado: 'PE',
    municipio: 'Goiana',
    areaTecnica: 'Tratamento de Efluentes & ETE',
    natureza: 'Planejamento Orçamentário Aprovado (PCA 2027)',
    status: 'PLANEJADA',
    alertaTipo: 'Oportunidade potencial futura'
  },
  {
    id: 'PCA-CPRH-2027-02',
    recordType: RecordType.PLANNED_PURCHASE,
    portal: 'PNCP (PCA)',
    orgao: 'Agência Estadual de Meio Ambiente de Pernambuco - CPRH',
    titulo: 'Rede Automática de Monitoramento de Qualidade do Ar na RMR',
    objetoPlanejado: 'Aquisição e contratação de operação continuada de estações automáticas de monitoramento de emissões atmosféricas e particulados.',
    previsaoLicitacao: '2º Trimestre / 2027',
    valorEstimado: 'R$ 3.200.000,00',
    estado: 'PE',
    municipio: 'Recife / Região Metropolitana',
    areaTecnica: 'Emissões Atmosféricas & Isocinética',
    natureza: 'Planejamento Orçamentário Aprovado (PCA 2027)',
    status: 'PLANEJADA',
    alertaTipo: 'Oportunidade potencial futura'
  },
  {
    id: 'PCA-SUAPE-2027-03',
    recordType: RecordType.PLANNED_PURCHASE,
    portal: 'PNCP (PCA)',
    orgao: 'Complexo Industrial Portuário de Suape',
    titulo: 'Gerenciamento Total de Resíduos Perigosos e Licenciamento Offshore',
    objetoPlanejado: 'Serviços de consultoria ambiental contínua, auditoria de PGRS e prontidão para resposta a incidentes com efluentes oleosos.',
    previsaoLicitacao: '4º Trimestre / 2026',
    valorEstimado: 'R$ 4.700.000,00',
    estado: 'PE',
    municipio: 'Ipojuca',
    areaTecnica: 'Gestão de Resíduos & Licenciamento Ambiental',
    natureza: 'Planejamento Orçamentário Aprovado (PCA 2027)',
    status: 'PLANEJADA',
    alertaTipo: 'Oportunidade potencial futura'
  }
];

export class PCAService {
  static getPlannedPurchases() {
    return MOCK_PCA_RECORDS;
  }

  static getPlannedPurchaseById(id) {
    return MOCK_PCA_RECORDS.find(p => p.id === id) || null;
  }
}
