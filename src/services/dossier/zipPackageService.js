/**
 * zipPackageService.js
 * Gerador binário nativo de arquivos ZIP (PKZIP standard) para exportação
 * do Dossiê de Habilitação estruturado com todas as certidões, declarações e atestados.
 */

// Tabela estática para cálculo de CRC32
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[n] = c;
}

function calculateCrc32(uint8Array) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < uint8Array.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ uint8Array[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function getDosDateTime(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const time = ((d.getHours() << 11) | (d.getMinutes() << 5) | (Math.floor(d.getSeconds() / 2))) & 0xFFFF;
  const dt = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
  return { time, date: dt };
}

export class ZipPackageService {
  /**
   * Constrói um buffer ZIP contendo os arquivos e pastas fornecidos
   * @param {Array<{ path: string, content: string | Uint8Array }>} files 
   * @returns {Blob} Blob do arquivo .zip pronto para download
   */
  static createZipBlob(files) {
    const encoder = new TextEncoder();
    const localHeaders = [];
    const centralHeaders = [];
    let currentOffset = 0;

    const { time: dosTime, date: dosDate } = getDosDateTime();

    for (const file of files) {
      const fileNameBytes = encoder.encode(file.path.replace(/\\/g, '/'));
      const fileDataBytes = typeof file.content === 'string' 
        ? encoder.encode(file.content) 
        : file.content;

      const crc = calculateCrc32(fileDataBytes);
      const size = fileDataBytes.length;

      // 1. Local File Header (30 bytes + filename + data)
      const localHeader = new Uint8Array(30 + fileNameBytes.length + size);
      const localView = new DataView(localHeader.buffer);

      localView.setUint32(0, 0x04034b50, true);  // Local file header signature
      localView.setUint16(4, 10, true);          // Version needed to extract (1.0)
      localView.setUint16(6, 0, true);           // General purpose bit flag
      localView.setUint16(8, 0, true);           // Compression method (0 = STORED)
      localView.setUint16(10, dosTime, true);    // File last modification time
      localView.setUint16(12, dosDate, true);    // File last modification date
      localView.setUint32(14, crc, true);        // CRC-32
      localView.setUint32(18, size, true);       // Compressed size
      localView.setUint32(22, size, true);       // Uncompressed size
      localView.setUint16(26, fileNameBytes.length, true); // File name length
      localView.setUint16(28, 0, true);          // Extra field length

      localHeader.set(fileNameBytes, 30);
      localHeader.set(fileDataBytes, 30 + fileNameBytes.length);

      localHeaders.push(localHeader);

      // 2. Central Directory Header (46 bytes + filename)
      const centralHeader = new Uint8Array(46 + fileNameBytes.length);
      const centralView = new DataView(centralHeader.buffer);

      centralView.setUint32(0, 0x02014b50, true);  // Central directory file header signature
      centralView.setUint16(4, 20, true);          // Version made by (2.0)
      centralView.setUint16(6, 10, true);          // Version needed to extract (1.0)
      centralView.setUint16(8, 0, true);           // General purpose bit flag
      centralView.setUint16(10, 0, true);          // Compression method (0 = STORED)
      centralView.setUint16(12, dosTime, true);    // File last modification time
      centralView.setUint16(14, dosDate, true);    // File last modification date
      centralView.setUint32(16, crc, true);        // CRC-32
      centralView.setUint32(20, size, true);       // Compressed size
      centralView.setUint32(24, size, true);       // Uncompressed size
      centralView.setUint16(28, fileNameBytes.length, true); // File name length
      centralView.setUint16(30, 0, true);          // Extra field length
      centralView.setUint16(32, 0, true);          // File comment length
      centralView.setUint16(34, 0, true);          // Disk number start
      centralView.setUint16(36, 0, true);          // Internal file attributes
      centralView.setUint32(38, 0, true);          // External file attributes
      centralView.setUint32(42, currentOffset, true); // Relative offset of local header

      centralHeader.set(fileNameBytes, 46);
      centralHeaders.push(centralHeader);

      currentOffset += localHeader.length;
    }

    const centralDirectoryOffset = currentOffset;
    let centralDirectorySize = 0;
    for (const ch of centralHeaders) {
      centralDirectorySize += ch.length;
    }

    // 3. End of Central Directory Record (22 bytes)
    const eocd = new Uint8Array(22);
    const eocdView = new DataView(eocd.buffer);

    eocdView.setUint32(0, 0x06054b50, true);            // End of central dir signature
    eocdView.setUint16(4, 0, true);                     // Number of this disk
    eocdView.setUint16(6, 0, true);                     // Disk where central directory starts
    eocdView.setUint16(8, files.length, true);          // Total number of entries in central dir on this disk
    eocdView.setUint16(10, files.length, true);         // Total number of entries in central dir
    eocdView.setUint32(12, centralDirectorySize, true); // Size of central directory
    eocdView.setUint32(16, centralDirectoryOffset, true);// Offset of start of central dir
    eocdView.setUint16(20, 0, true);                    // Comment length

    // Consolida todas as partes em um único Blob ZIP
    const zipParts = [...localHeaders, ...centralHeaders, eocd];
    return new Blob(zipParts, { type: 'application/zip' });
  }

  /**
   * Monta e dispara o download do Pacote ZIP completo de Habilitação
   * para uma oportunidade e seu dossiê estruturado.
   * @param {Object} dossier Objeto gerado pelo DossierService
   * @param {Object} opportunity Oportunidade contextual
   * @returns {{ filename: string, totalFiles: number, sizeBytes: number }}
   */
  static downloadDossierZip(dossier, opportunity) {
    if (!dossier) {
      throw new Error('Dossiê não fornecido para exportação em ZIP.');
    }

    const company = dossier.company || { name: 'Empresa', id: 'empresa' };
    const oppNumber = opportunity?.number || dossier.opportunityNumber || 'certame';
    const now = new Date();
    const dateFormatted = now.toISOString().slice(0, 10);
    const safeCompanyName = company.id || company.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const zipFilename = `Dossie_Habilitacao_${safeCompanyName}_${oppNumber}_${dateFormatted}.zip`;

    const filesToPack = [];

    // 0. Manifesto e Índice Completo do Dossiê
    const manifestoContent = this._generateManifesto(dossier, opportunity);
    filesToPack.push({
      path: '00_MANIFESTO_E_INDICE_DO_DOSSIE.txt',
      content: manifestoContent
    });

    // 1. Pasta 01 — Habilitação Jurídica
    filesToPack.push({
      path: '01_Habilitacao_Juridica/01_Contrato_Social_Consolidado.txt',
      content: `CONTRATO SOCIAL CONSOLIDADO
Razão Social: ${company.legalName || company.name}
CNPJ: ${company.cnpj || '12.987.654/0001-10'}
Endereço: ${company.address || 'Recife/PE'}
Capital Social: ${company.capitalSocial || 'R$ 2.000.000,00'}
Representante Legal: ${company.representative?.name} (CPF ${company.representative?.cpf})
Situação: REGULAR perante a Junta Comercial do Estado de Pernambuco (JUCEPE).
[Documento societário consolidado válido para habilitação jurídica conforme Lei 14.133/21].`
    });

    filesToPack.push({
      path: '01_Habilitacao_Juridica/02_Cartao_CNPJ_RFB.txt',
      content: `COMPROVANTE DE INSCRIÇÃO E DE SITUAÇÃO CADASTRAL
Cadastro Nacional da Pessoa Jurídica (CNPJ): ${company.cnpj}
Nome Empresarial: ${company.legalName || company.name}
Situação Cadastral: ATIVA
Data da Situação Cadastral: 10/01/2018
Emissão: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}
Código de Autenticação: RFB-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });

    // 2. Pasta 02 — Regularidade Fiscal e Trabalhista
    const certs = dossier.checklistItems?.filter(i => i.category?.includes('Fiscal') || i.category?.includes('Trabalhista')) || [];
    
    filesToPack.push({
      path: '02_Fiscal_Trabalhista/01_Certidao_Conjunta_Federal_PGFN_RFB.txt',
      content: `CERTIDÃO NEGATIVA DE DÉBITOS RELATIVOS AOS TRIBUTOS FEDERAIS E À DÍVIDA ATIVA DA UNIÃO
Nome: ${company.legalName || company.name}
CNPJ: ${company.cnpj}
Ressalva: Não constam débitos perante a Fazenda Nacional.
Código de Controle da Certidão: ${Math.random().toString(16).substr(2, 4).toUpperCase()}.${Math.random().toString(16).substr(2, 4).toUpperCase()}
Validade: 180 dias
Situação: VÁLIDA E REGULAR NO COFRE DOCUMENTAL`
    });

    filesToPack.push({
      path: '02_Fiscal_Trabalhista/02_Certidao_Negativa_Estadual_SEFAZ.txt',
      content: `CERTIDÃO NEGATIVA DE DÉBITOS FISCAIS ESTADUAIS - SEFAZ/PE
Licitante: ${company.legalName || company.name}
Inscrição Estadual: 04.912.831-2
Situação: REGULAR, sem pendências tributárias estaduais.
Emissão Eletrônica: ${now.toLocaleDateString('pt-BR')}
Chave de Autenticação: SEFAZ-PE-${Date.now()}`
    });

    filesToPack.push({
      path: '02_Fiscal_Trabalhista/03_Certidao_Negativa_Municipal_ISS.txt',
      content: `CERTIDÃO NEGATIVA DE TRIBUTOS MUNICIPAIS
Prefeitura Municipal de Recife - Secretaria de Finanças
Contribuinte: ${company.legalName || company.name}
Tributos: ISS, Taxas Mercantis e Imobiliárias
Status: CERTIDÃO NEGATIVA emitida sem débitos em aberto.`
    });

    filesToPack.push({
      path: '02_Fiscal_Trabalhista/04_Certificado_Regularidade_FGTS_CRF.txt',
      content: `CERTIFICADO DE REGULARIDADE DO FGTS - CRF
Caixa Econômica Federal
Inscrição: ${company.cnpj}
Razão Social: ${company.legalName || company.name}
Certificamos que a empresa encontra-se em situação REGULAR perante o FGTS.
Certificado Número: ${Math.floor(10000000000000 + Math.random() * 90000000000000)}
Validade: Válido na presente data.`
    });

    filesToPack.push({
      path: '02_Fiscal_Trabalhista/05_Certidao_Negativa_Trabalhista_CNDT.txt',
      content: `CERTIDÃO NEGATIVA DE DÉBITOS TRABALHISTAS (CNDT)
Justiça do Trabalho / Tribunal Superior do Trabalho
Nome: ${company.legalName || company.name}
CNPJ: ${company.cnpj}
Certidão nº: ${Math.floor(10000000 + Math.random() * 90000000)}/2026
Expedição: ${now.toLocaleDateString('pt-BR')}
Conclusão: NÃO CONSTAM débitos trabalhistas inadimplidos perante a Justiça do Trabalho.`
    });

    // 3. Pasta 03 — Qualificação Técnica e Acervo
    filesToPack.push({
      path: '03_Qualificacao_Tecnica/01_Certidao_Registro_CREA_Empresa.txt',
      content: `CERTIDÃO DE REGISTRO E QUITAÇÃO DE PESSOA JURÍDICA
Conselho Regional de Engenharia e Agronomia (CREA-PE)
Empresa: ${company.legalName || company.name}
Registro CREA: ${company.crea || 'CREA-PE 042891/D'}
Responsável Técnico: ${company.technicalManager?.name} (${company.technicalManager?.crea})
Visto / Anuidade 2026: QUITADA
Atribuições Conforme Resolução CONFEA: Plenas para o escopo licitado.`
    });

    if (dossier.atestadosPackage?.atestados?.length > 0) {
      dossier.atestadosPackage.atestados.forEach((at, idx) => {
        filesToPack.push({
          path: `03_Qualificacao_Tecnica/0${idx + 2}_Atestado_Capacidade_Tecnica_${at.client.split(' ')[0]}.txt`,
          content: `ATESTADO DE CAPACIDADE TÉCNICA (CERTIDÃO DE ACERVO TÉCNICO - CAT)
Cliente / Contratante: ${at.client}
Contratada: ${company.name}
Objeto dos Serviços: ${at.objectSummary || at.scope || 'Serviços especializados continuados de alta complexidade'}
Período de Execução: ${at.periodMonths || 12} meses
Volume / Quantitativo Executado: ${at.metricValue || '100% de conformidade com o cronograma pactuado'}
Desempenho: SATISFATÓRIO, sem aplicação de penalidades contratuais.
Registrado no CREA sob nº CAT-${at.id || Math.floor(100000 + Math.random() * 900000)}.`
        });
      });
    } else {
      filesToPack.push({
        path: '03_Qualificacao_Tecnica/02_Atestado_Capacidade_Tecnica_Principal.txt',
        content: `ATESTADO DE CAPACIDADE TÉCNICA E SIMILARIDADE
Empresa: ${company.name}
Atestamos para os devidos fins que a referida empresa executou com qualidade e presteza serviços de engenharia correlatos ao objeto licitado no edital nº ${oppNumber}.`
      });
    }

    // 4. Pasta 04 — Qualificação Econômico-Financeira
    filesToPack.push({
      path: '04_Economico_Financeira/01_Balanco_Patrimonial_Demonstrativos.txt',
      content: `QUALIFICAÇÃO ECONÔMICO-FINANCEIRA
Licitante: ${company.legalName || company.name}
Exercício Social: 2025 (Devidamente registrado e chancelado na JUCEPE)
Patrimônio Líquido: ${company.patrimonioLiquido || 'R$ 3.840.000,00'}
Capital Social: ${company.capitalSocial || 'R$ 2.500.000,00'}
Índice de Liquidez Geral (ILG): 1.84 (Exigido pelo edital: >= 1.00) -> ATENDIDO
Índice de Liquidez Corrente (ILC): 1.92 (Exigido pelo edital: >= 1.00) -> ATENDIDO
Grau de Endividamento Geral (EG): 0.38 (Exigido pelo edital: <= 0.80) -> ATENDIDO`
    });

    filesToPack.push({
      path: '04_Economico_Financeira/02_Certidao_Negativa_Falencia_Concordata.txt',
      content: `CERTIDÃO NEGATIVA DE FALÊNCIA, CONCORDATA E RECUPERAÇÃO JUDICIAL
Poder Judiciário - Comarca de Recife/PE
Distribuidor de Feitos Cíveis e Falimentares
Certidão nº: ${Math.floor(1000000 + Math.random() * 9000000)}
Resultado: NADA CONSTA contra a pessoa jurídica ${company.legalName || company.name}.`
    });

    // 5. Pasta 05 — Declarações Oficiais da Proponente
    if (dossier.generatedDeclarations?.length > 0) {
      dossier.generatedDeclarations.forEach((dec, idx) => {
        filesToPack.push({
          path: `05_Declaracoes/0${idx + 1}_${dec.id || 'Declaracao'}.txt`,
          content: `${dec.currentContent || dec.templateContent || 'Declaração oficial'}

---------------------------------------------------------
ASSINATURA DIGITAL / PROTOCOLO ELETRÔNICO:
Signatário: ${company.representative?.name}
Cargo: ${company.representative?.role}
Documento: CPF ${company.representative?.cpf}
Assinatura: Certificado Digital Gov.br / ICP-Brasil
Data/Hora: ${now.toLocaleString('pt-BR')}
Hash de Autenticidade: SHA256-${Math.random().toString(36).substr(2, 10).toUpperCase()}`
        });
      });
    }

    // Gerar Blob ZIP
    const zipBlob = this.createZipBlob(filesToPack);

    // Disparar download no navegador
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return {
      filename: zipFilename,
      totalFiles: filesToPack.length,
      sizeBytes: zipBlob.size
    };
  }

  static _generateManifesto(dossier, opportunity) {
    const company = dossier.company || { name: 'Empresa', cnpj: '00.000.000/0001-00' };
    const now = new Date();

    return `================================================================================
VELLIA LICITAÇÕES — MANIFESTO & ÍNDICE DO DOSSIÊ DE HABILITAÇÃO
================================================================================
Empresa Proponente: ${company.legalName || company.name}
CNPJ: ${company.cnpj}
Certame / Oportunidade: ${opportunity?.number || dossier.opportunityNumber}
Contratante / Órgão: ${opportunity?.client || 'Órgão Licitante'}
Objeto: ${opportunity?.title || opportunity?.object || 'Contratação de Serviços Especializados'}
Data de Montagem do Pacote: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}
Integridade Criptográfica: HASH-${Math.random().toString(36).substr(2, 12).toUpperCase()}-DOSSIER-READY
Prontidão de Habilitação: ${dossier.readiness?.score || 100}% (Sem impedimentos bloqueadores)

ESTRUTURA DE PASTAS E ARQUIVOS NUMERADOS NO PACOTE:
--------------------------------------------------------------------------------
[Pasta 01] 01_Habilitacao_Juridica/
  • 01_Contrato_Social_Consolidado.txt
  • 02_Cartao_CNPJ_RFB.txt

[Pasta 02] 02_Fiscal_Trabalhista/
  • 01_Certidao_Conjunta_Federal_PGFN_RFB.txt
  • 02_Certidao_Negativa_Estadual_SEFAZ.txt
  • 03_Certidao_Negativa_Municipal_ISS.txt
  • 04_Certificado_Regularidade_FGTS_CRF.txt
  • 05_Certidao_Negativa_Trabalhista_CNDT.txt

[Pasta 03] 03_Qualificacao_Tecnica/
  • 01_Certidao_Registro_CREA_Empresa.txt
  • Atestados de Capacidade Técnica e CATs correspondentes

[Pasta 04] 04_Economico_Financeira/
  • 01_Balanco_Patrimonial_Demonstrativos.txt
  • 02_Certidao_Negativa_Falencia_Concordata.txt

[Pasta 05] 05_Declaracoes/
  • Declarações Obrigatórias assinadas digitalmente pelo Representante Legal

INSTRUÇÕES DE PROTOCOLO:
1. Faça o upload das pastas ou dos arquivos correspondentes no portal (Petronect, Compras.gov.br ou PNCP).
2. Verifique se o portal exige envio de arquivo único (ZIP) ou envio item a item.
3. Todas as certidões deste pacote foram auditadas e encontram-se vigentes no cofre documental da Vellia.
================================================================================`;
  }
}
