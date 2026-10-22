/**
 * VELLIA LICITAÇÕES — VERIFICADOR DE CONFORMIDADE DOCUMENTAL (COFRE -> OPORTUNIDADE)
 * Cruza as exigências de um certame com o acervo técnico e certidões reais da empresa.
 */

import { DocumentVaultService, DocumentCategory, DocumentSubCategory } from './documentVaultService.js';
import { initialCompanyCertificates } from '../edital/companyCertificatesRepository.js';

export class DocumentComplianceChecker {
  /**
   * Converte string de data no formato DD/MM/YYYY para Date
   */
  static parseDate(dateStr) {
    if (!dateStr) return null;
    try {
      const parts = String(dateStr).split(/[-/]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        } else {
          return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
      }
      return new Date(dateStr);
    } catch {
      return null;
    }
  }

  /**
   * Normaliza o identificador da empresa
   */
  static resolveCompanyId(companyNameOrId) {
    const raw = String(companyNameOrId || '').toLowerCase();
    if (raw.includes('veeluen') || raw.includes('vs-')) {
      return 'veeluen-solutions';
    }
    return 'excelencia-ambiental';
  }

  /**
   * Avalia a conformidade completa dos documentos de uma oportunidade
   */
  static checkCompliance(opportunity) {
    if (!opportunity) {
      return {
        companyId: 'excelencia-ambiental',
        companyName: 'Excelência Ambiental',
        overallStatus: 'REGULAR',
        complianceScore: 100,
        certificates: [],
        blockingIssues: [],
        attestation: null,
        canParticipate: true
      };
    }

    const companyId = this.resolveCompanyId(opportunity.recommendedCompany || opportunity.company);
    const companyName = companyId === 'veeluen-solutions' ? 'Veeluen Solutions' : 'Excelência Ambiental';
    const fallbackData = initialCompanyCertificates[companyId] || initialCompanyCertificates['excelencia-ambiental'];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const blockingIssues = [];
    let hasExpired = false;
    let hasExpiringSoon = false;

    // 1. AVALIAÇÃO DE CERTIDÕES FISCAIS / TRABALHISTAS / FGTS
    const certEntries = Object.entries(fallbackData.certidoes || {}).map(([key, cert]) => {
      const expiry = this.parseDate(cert.validade);
      let daysRemaining = 90;
      let isExpired = false;
      let isExpiringSoon = false;

      if (expiry) {
        const diffTime = expiry - today;
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (daysRemaining < 0) {
          isExpired = true;
          hasExpired = true;
          blockingIssues.push({
            type: 'EXPIRED',
            certKey: key,
            title: `${cert.nome} VENCIDA`,
            desc: `Venceu em ${cert.validade}. Renovação obrigatória para emissão de proposta.`
          });
        } else if (daysRemaining <= 15) {
          isExpiringSoon = true;
          hasExpiringSoon = true;
          blockingIssues.push({
            type: 'EXPIRING_SOON',
            certKey: key,
            title: `${cert.nome} vence em ${daysRemaining} dias`,
            desc: `Expira em ${cert.validade}. Recomenda-se emissão preventiva.`
          });
        }
      }

      return {
        key,
        nome: cert.nome,
        validade: cert.validade,
        daysRemaining,
        status: isExpired ? 'VENCIDA' : isExpiringSoon ? 'VENCE EM BREVE' : 'VÁLIDA',
        statusColor: isExpired ? '#EF4444' : isExpiringSoon ? '#F59E0B' : '#10B981',
        isOk: !isExpired && !isExpiringSoon
      };
    });

    // 2. VINCULAÇÃO DE ATESTADO DE CAPACIDADE TÉCNICA (CAT)
    const oppText = `${opportunity.title || ''} ${opportunity.object || ''} ${opportunity.primaryService || ''}`.toLowerCase();
    const attestations = fallbackData.atestados || [];
    
    // Procura atestado com maior aderência
    let matchedAttestation = attestations[0];
    if (oppText.includes('isocin') || oppText.includes('chamin') || oppText.includes('emiss')) {
      matchedAttestation = attestations.find(a => a.id === 'atest-ea-01') || attestations[0];
    } else if (oppText.includes('efluente') || oppText.includes('ete') || oppText.includes('sanit')) {
      matchedAttestation = attestations.find(a => a.id === 'atest-vs-01') || attestations[0];
    } else if (oppText.includes('nr-13') || oppText.includes('caldeira') || oppText.includes('vaso')) {
      matchedAttestation = attestations.find(a => a.id === 'atest-vs-02') || attestations[0];
    }

    // 3. SCORE DE CONFORMIDADE (0 a 100%)
    let complianceScore = 100;
    if (hasExpired) complianceScore -= 40;
    if (hasExpiringSoon) complianceScore -= 15;
    if (!matchedAttestation) complianceScore -= 20;

    let overallStatus = 'REGULAR';
    let statusBadge = {
      label: 'Habilitação 100% Regular',
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.15)'
    };

    if (hasExpired) {
      overallStatus = 'IMPEDIMENTO';
      statusBadge = {
        label: `${blockingIssues.length} Certidão Vencida`,
        color: '#EF4444',
        bg: 'rgba(239, 68, 68, 0.15)'
      };
    } else if (hasExpiringSoon) {
      overallStatus = 'ATENCAO';
      statusBadge = {
        label: `Atenção: ${blockingIssues[0]?.title || 'Certidão a vencer'}`,
        color: '#F59E0B',
        bg: 'rgba(245, 158, 11, 0.15)'
      };
    }

    return {
      companyId,
      companyName,
      overallStatus,
      complianceScore: Math.max(0, complianceScore),
      statusBadge,
      certificates: certEntries,
      blockingIssues,
      attestation: matchedAttestation ? {
        id: matchedAttestation.id,
        cliente: matchedAttestation.cliente,
        servico: matchedAttestation.servico,
        artNumero: matchedAttestation.artNumero,
        volume: matchedAttestation.volume,
        scoreBase: matchedAttestation.scoreBase || 95
      } : null,
      canParticipate: !hasExpired
    };
  }
}

export default DocumentComplianceChecker;
