/**
 * VELLIA LICITAÇÕES - INGESTION SERVICE (FASE 5)
 * Teste e simulação de ingestão de dados públicos do portal Petronect.
 * Executa deduplicação, análise semântica em lote, geração de métricas e relatório.
 */

import { opportunityRepository } from './opportunityRepository';
import { OpportunityService } from './opportunityService';
import { DeduplicationService } from './deduplicationService';
import { sourceRepository } from './sourceRepository';
import { logService, LogType } from './logService';

export const PETRONECT_TEST_BATCH = [
  {
    number: '7004390011',
    portal: 'Petronect',
    client: 'Petrobras - Refinaria Abreu e Lima',
    title: 'Serviços de medição e monitoramento de emissões atmosféricas em dutos',
    object: 'Monitoramento contínuo de emissões atmosféricas e fontes estacionárias para atendimento às condicionantes de licença ambiental da RNEST.',
    description: 'Campanhas periódicas de medição de gases SOx, NOx e CO em chaminés de processo industrial.',
    location: 'Ipojuca - PE',
    state: 'PE',
    city: 'Ipojuca',
    daysLeft: 16,
    estimatedValue: 'R$ 1.850.000,00',
    modality: 'Licitação Eletrônica Petronect',
    url: 'https://petronect.com/portal/7004390011'
  },
  {
    number: '7004390012',
    portal: 'Petronect',
    client: 'Transpetro - Terminal Aquaviário de Suape',
    title: 'Operação continuada e controle operacional de ETE industrial e sanitária',
    object: 'Prestação de serviços contínuos de operação, acompanhamento físico-químico e manutenção de sistema de tratamento de esgoto sanitário e efluentes.',
    description: 'Condução operacional 24/7 com equipe residente, descarte conforme CONAMA 430.',
    location: 'Ipojuca - PE',
    state: 'PE',
    city: 'Ipojuca',
    daysLeft: 14,
    estimatedValue: 'R$ 2.920.000,00',
    modality: 'Concorrência Pública',
    url: 'https://petronect.com/portal/7004390012'
  },
  {
    number: '7004390013',
    portal: 'Petronect',
    client: 'Petrobras - UO-BS',
    title: 'Inspeção de segurança periódica de caldeiras e vasos de pressão NR-13',
    object: 'Inspeção de segurança em vasos de pressão e equipamentos pressurizados com realização de ensaios não destrutivos e emissão de laudo técnico NR-13.',
    description: 'Medição de espessura por ultrassom, teste hidrostático e reconstituição de prontuários com Engenheiro Mecânico Habilitado.',
    location: 'Santos - SP',
    state: 'SP',
    city: 'Santos',
    daysLeft: 11,
    estimatedValue: 'R$ 980.000,00',
    modality: 'Cotação Eletrônica',
    url: 'https://petronect.com/portal/7004390013'
  },
  {
    number: '7004390014',
    portal: 'Petronect',
    client: 'Petrobras - Regap Betim',
    title: 'Amostragem isocinética de chaminés e material particulado',
    object: 'Amostragem isocinética em chaminés e dutos de exaustão de caldeiras e turbogeradores, conforme metodologia EPA Method 5.',
    description: 'Coleta de particulados totais e análise laboratorial acreditada ISO 17025.',
    location: 'Betim - MG',
    state: 'MG',
    city: 'Betim',
    daysLeft: 9,
    estimatedValue: 'R$ 740.000,00',
    modality: 'Licitação Eletrônica',
    url: 'https://petronect.com/portal/7004390014'
  },
  {
    number: '7004390015',
    portal: 'Petronect',
    client: 'Petrobras - Polo Catu',
    title: 'Manutenção preventiva e corretiva eletromecânica industrial em tubulações e bombas',
    object: 'Prestação de serviços contínuos de manutenção industrial, caldeiraria, tubulações e válvulas de processo.',
    description: 'Manutenção de sistemas de bombeamento e utilidades industriais com equipe técnica qualificada.',
    location: 'Catu - BA',
    state: 'BA',
    city: 'Catu',
    daysLeft: 18,
    estimatedValue: 'R$ 1.650.000,00',
    modality: 'Licitação Eletrônica',
    url: 'https://petronect.com/portal/7004390015'
  },
  {
    number: '7004390016',
    portal: 'Petronect',
    client: 'Transpetro - Terminal Madre de Deus',
    title: 'Gerenciamento, acondicionamento e destinação de resíduos sólidos industriais',
    object: 'Prestação de serviços de gestão de resíduos Classe I e II com emissão de MTR e elaboração de PGRS.',
    description: 'Coleta, transporte rodoviário licenciado e coprocessamento ou disposição em aterro industrial credenciado.',
    location: 'Madre de Deus - BA',
    state: 'BA',
    city: 'Madre de Deus',
    daysLeft: 20,
    estimatedValue: 'R$ 1.120.000,00',
    modality: 'Concorrência Pública',
    url: 'https://petronect.com/portal/7004390016'
  },
  {
    number: '7004390017',
    portal: 'Petronect',
    client: 'Petrobras - Termelétrica Canoas',
    title: 'Instalação de sistema de geração de energia solar fotovoltaica em cobertura predial',
    object: 'Projeto executivo e implantação de usina solar fotovoltaica para suprimento de energia auxiliar predial.',
    description: 'Fornecimento de módulos fotovoltaicos, inversores e conexão à rede de média tensão.',
    location: 'Canoas - RS',
    state: 'RS',
    city: 'Canoas',
    daysLeft: 25,
    estimatedValue: 'R$ 820.000,00',
    modality: 'Licitação Eletrônica',
    url: 'https://petronect.com/portal/7004390017'
  },
  {
    number: '7004390018',
    portal: 'Petronect',
    client: 'Petrobras - Refinaria Lubnor',
    title: 'Obras civis industriais de pavimentação e recuperação de bacias de contenção',
    object: 'Execução de obras civis e intervenções de infraestrutura em concreto armado e impermeabilização de bacias.',
    description: 'Adequação estrutural e reforma predial em áreas de tancagem.',
    location: 'Fortaleza - CE',
    state: 'CE',
    city: 'Fortaleza',
    daysLeft: 15,
    estimatedValue: 'R$ 1.450.000,00',
    modality: 'Licitação Eletrônica',
    url: 'https://petronect.com/portal/7004390018'
  },
  // Oportunidades SEM relação com o portfólio (para testar baixa aderência e descarte)
  {
    number: '7004390019',
    portal: 'Petronect',
    client: 'Petrobras - Edifício Sede EDISE',
    title: 'Aquisição de suprimentos de informática, papelaria e material de escritório',
    object: 'Fornecimento continuado de folhas A4, toners de impressão, canetas e materiais administrativos de consumo.',
    description: 'Entrega parcelada de material de escritório sob demanda para prédios administrativos.',
    location: 'Rio de Janeiro - RJ',
    state: 'RJ',
    city: 'Rio de Janeiro',
    daysLeft: 8,
    estimatedValue: 'R$ 180.000,00',
    modality: 'Pregão Eletrônico',
    url: 'https://petronect.com/portal/7004390019'
  },
  {
    number: '7004390020',
    portal: 'Petronect',
    client: 'Petrobras - Base Operacional Imbetiba',
    title: 'Serviços de alimentação corporativa, coffee break e buffet para reuniões técnicas',
    object: 'Contratação de empresa para fornecimento de lanches prontos, bebidas e serviços de copa em eventos institucionais.',
    description: 'Preparação e entrega de kits de alimentação e coffee break.',
    location: 'Macaé - RJ',
    state: 'RJ',
    city: 'Macaé',
    daysLeft: 6,
    estimatedValue: 'R$ 95.000,00',
    modality: 'Cotação Direta',
    url: 'https://petronect.com/portal/7004390020'
  },
  // Item intencionalmente duplicado com a oportunidade já existente 7004321234
  {
    number: '7004321234',
    portal: 'Petronect',
    client: 'Petrobras - Refinaria Abreu e Lima (RNEST)',
    title: 'Monitoramento de emissões atmosféricas em dutos e chaminés industriais (Atualização de Aditivo)',
    object: 'Contratação de serviços de medição e monitoramento contínuo de emissões atmosféricas em fontes estacionárias.',
    description: 'Aditivo com prorrogação e detalhamento das sondas de amostragem.',
    location: 'Ipojuca - PE',
    state: 'PE',
    city: 'Ipojuca',
    daysLeft: 12,
    estimatedValue: 'R$ 2.450.000,00',
    modality: 'Licitação Eletrônica Petronect',
    url: 'https://petronect.com/portal/oportunidade/7004321234'
  }
];

export class IngestionService {
  /**
   * Executa o teste de ingestão simulada do Petronect
   */
  static runPetronectTest() {
    const rawBatch = PETRONECT_TEST_BATCH;
    const currentList = opportunityRepository.getAll();

    const report = {
      received: rawBatch.length,
      newCount: 0,
      updatedCount: 0,
      duplicateCount: 0,
      relevantCount: 0, // Score >= 70%
      highPriorityCount: 0, // Score >= 80%
      discardedCount: 0, // Score < 50%
      errorCount: 0,
      executionTimeMs: 0,
      timestamp: new Date().toISOString(),
      itemsReport: []
    };

    const startTime = performance.now();

    for (const raw of rawBatch) {
      try {
        const dupCheck = DeduplicationService.findDuplicate(raw, currentList);

        if (dupCheck.isDuplicate) {
          const merged = DeduplicationService.mergeOpportunity(dupCheck.existingItem, raw);
          opportunityRepository.update(dupCheck.existingItem.id, merged);
          report.duplicateCount++;
          report.updatedCount++;

          if (merged.score >= 80) report.highPriorityCount++;
          if (merged.score >= 70) report.relevantCount++;
          if (merged.score < 50) report.discardedCount++;

          report.itemsReport.push({
            number: merged.number,
            title: merged.title,
            score: merged.score,
            company: merged.recommendedCompany,
            classification: merged.score >= 90 ? 'Crítica' : merged.score >= 80 ? 'Alta' : merged.score >= 70 ? 'Média' : 'Baixa',
            status: 'Atualizado (Duplicado Detectado)'
          });
        } else {
          const enriched = OpportunityService.enrichOpportunity(raw, 'Petronect');
          opportunityRepository.add(enriched);
          currentList.unshift(enriched);
          report.newCount++;

          if (enriched.score >= 80) report.highPriorityCount++;
          if (enriched.score >= 70) report.relevantCount++;
          if (enriched.score < 50) report.discardedCount++;

          report.itemsReport.push({
            number: enriched.number,
            title: enriched.title,
            score: enriched.score,
            company: enriched.recommendedCompany,
            classification: enriched.priority,
            status: 'Novo Ingerido'
          });
        }
      } catch (err) {
        report.errorCount++;
        logService.addLog(LogType.ERROR, `Erro ao processar item do pacote de teste: ${err.message}`, { raw });
      }
    }

    report.executionTimeMs = Math.round(performance.now() - startTime);

    // Atualiza a fonte Petronect no SourceRepository
    const nowFormatted = new Date().toLocaleString('pt-BR');
    sourceRepository.update('source-petronect', {
      status: 'Ativo',
      lastSync: `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      lastSuccess: nowFormatted,
      capturedCount: (sourceRepository.getById('source-petronect')?.capturedCount || 0) + report.received,
      newCount: (sourceRepository.getById('source-petronect')?.newCount || 0) + report.newCount,
      relevantCount: (sourceRepository.getById('source-petronect')?.relevantCount || 0) + report.relevantCount,
      errorCount: report.errorCount
    });

    logService.addLog(LogType.INGESTION, `Teste de ingestão Petronect finalizado: ${report.received} recebidos, ${report.newCount} novos, ${report.duplicateCount} duplicados.`, report);

    return report;
  }
}
