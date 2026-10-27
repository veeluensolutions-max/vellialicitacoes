/**
 * VELLIA LICITAÇÕES — CENTRAL AUTÔNOMA DE MONITORAMENTO DE CNDS E REGULARIDADE FISCAL
 * Monitora a validade de certidões tributárias, trabalhistas e judiciais das empresas consorciadas:
 * 1. VEELUEN SOLUTIONS LTDA (CNPJ 45.123.890/0001-44)
 * 2. EXCELÊNCIA AMBIENTAL LTDA (CNPJ 38.987.654/0001-22)
 */

import { EventBus, VELLIA_EVENTS } from '../eventBus.js';
import { logService, LogType } from '../logService.js';
import { alertService } from '../agent/alertService.js';
import { externalAlertDispatcher } from '../notifications/externalAlertDispatcher.js';

const STORAGE_KEY_CNDS = 'vellia_cnd_monitoring_v1';

export const CND_STATUS = {
  REGULAR: 'REGULAR',
  EXPIRING: 'EXPIRING', // <= 15 dias
  EXPIRED: 'EXPIRED',   // < 0 dias
  PENDING: 'PENDING'
};

export const CND_TYPES = {
  FEDERAL: 'FEDERAL',
  ESTADUAL: 'ESTADUAL',
  MUNICIPAL: 'MUNICIPAL',
  FGTS: 'FGTS',
  TRABALHISTA: 'TRABALHISTA',
  FALENCIA: 'FALENCIA',
  CREA: 'CREA'
};

const DEFAULT_CNDS_DATA = {
  'excelencia-ambiental': {
    companyId: 'excelencia-ambiental',
    companyName: 'Excelência Ambiental Engenharia e Consultoria Ltda',
    cnpj: '38.987.654/0001-22',
    certificates: [
      {
        id: 'cnd-ea-federal',
        type: CND_TYPES.FEDERAL,
        title: 'Certidão Conjunta Federal (RFB / PGFN)',
        issuer: 'Receita Federal do Brasil / Procuradoria-Geral da Fazenda Nacional',
        number: 'RFB-2026-881920-A',
        issueDate: '2026-06-21',
        expiryDate: '2026-12-18',
        portalUrl: 'https://solucoes.receita.fazenda.gov.br/servicos/certidaointernet/pj/emitir',
        verificationCode: 'D4A1.889F.001C.B982',
        mandatory: true
      },
      {
        id: 'cnd-ea-fgts',
        type: CND_TYPES.FGTS,
        title: 'Certificado de Regularidade do FGTS (CRF)',
        issuer: 'Caixa Econômica Federal',
        number: 'CRF-20261010-99812',
        issueDate: '2026-10-01',
        expiryDate: '2026-10-31',
        portalUrl: 'https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf',
        verificationCode: 'CX-99812-PE',
        mandatory: true
      },
      {
        id: 'cnd-ea-trabalhista',
        type: CND_TYPES.TRABALHISTA,
        title: 'Certidão Negativa de Débitos Trabalhistas (CNDT)',
        issuer: 'Tribunal Superior do Trabalho (TST / CSJT)',
        number: 'CNDT-449102-2026',
        issueDate: '2026-04-18',
        expiryDate: '2026-11-05',
        portalUrl: 'https://www.tst.jus.br/certidao',
        verificationCode: 'TST-88192-CSJT',
        mandatory: true
      },
      {
        id: 'cnd-ea-estadual',
        type: CND_TYPES.ESTADUAL,
        title: 'Certidão Negativa de Débitos Estaduais (SEFAZ-PE)',
        issuer: 'Secretaria da Fazenda de Pernambuco',
        number: 'SEFAZ-PE-902188',
        issueDate: '2026-05-29',
        expiryDate: '2026-11-25',
        portalUrl: 'https://efisco.sefaz.pe.gov.br',
        verificationCode: 'SEF-9021-PE',
        mandatory: true
      },
      {
        id: 'cnd-ea-municipal',
        type: CND_TYPES.MUNICIPAL,
        title: 'Certidão Negativa de Tributos Municipais (Recife)',
        issuer: 'Secretaria de Finanças do Município do Recife',
        number: 'REC-2026-33910',
        issueDate: '2026-07-14',
        expiryDate: '2027-01-10',
        portalUrl: 'https://portalfinancas.recife.pe.gov.br',
        verificationCode: 'MUN-REC-33910',
        mandatory: true
      },
      {
        id: 'cnd-ea-falencia',
        type: CND_TYPES.FALENCIA,
        title: 'Certidão Negativa de Falência e Recuperação Judicial',
        issuer: 'Tribunal de Justiça de Pernambuco (TJPE)',
        number: 'TJPE-DIST-2026-0912',
        issueDate: '2026-08-01',
        expiryDate: '2026-11-01',
        portalUrl: 'https://www.tjpe.jus.br/certidaoonline',
        verificationCode: 'TJPE-DIST-0912',
        mandatory: true
      },
      {
        id: 'cnd-ea-crea',
        type: CND_TYPES.CREA,
        title: 'Certidão de Registro e Quitação de Pessoa Jurídica (CREA)',
        issuer: 'Conselho Regional de Engenharia e Agronomia (CREA-PE)',
        number: 'CREA-PE-042891/D',
        issueDate: '2026-01-15',
        expiryDate: '2027-03-31',
        portalUrl: 'https://crea-pe.sitac.com.br',
        verificationCode: 'CREA-042891-2026',
        mandatory: true
      }
    ]
  },
  'veeluen-solutions': {
    companyId: 'veeluen-solutions',
    companyName: 'Veeluen Solutions Ltda',
    cnpj: '45.123.890/0001-44',
    certificates: [
      {
        id: 'cnd-vs-federal',
        type: CND_TYPES.FEDERAL,
        title: 'Certidão Conjunta Federal (RFB / PGFN)',
        issuer: 'Receita Federal do Brasil / PGFN',
        number: 'RFB-2026-773391-B',
        issueDate: '2026-06-25',
        expiryDate: '2026-12-22',
        portalUrl: 'https://solucoes.receita.fazenda.gov.br/servicos/certidaointernet/pj/emitir',
        verificationCode: 'E5B2.990A.112D.C093',
        mandatory: true
      },
      {
        id: 'cnd-vs-fgts',
        type: CND_TYPES.FGTS,
        title: 'Certificado de Regularidade do FGTS (CRF)',
        issuer: 'Caixa Econômica Federal',
        number: 'CRF-20261015-88741',
        issueDate: '2026-10-05',
        expiryDate: '2026-11-04',
        portalUrl: 'https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf',
        verificationCode: 'CX-88741-PE',
        mandatory: true
      },
      {
        id: 'cnd-vs-trabalhista',
        type: CND_TYPES.TRABALHISTA,
        title: 'Certidão Negativa de Débitos Trabalhistas (CNDT)',
        issuer: 'Tribunal Superior do Trabalho (TST)',
        number: 'CNDT-772910-2026',
        issueDate: '2026-05-30',
        expiryDate: '2026-11-26',
        portalUrl: 'https://www.tst.jus.br/certidao',
        verificationCode: 'TST-77291-CSJT',
        mandatory: true
      },
      {
        id: 'cnd-vs-estadual',
        type: CND_TYPES.ESTADUAL,
        title: 'Certidão Negativa de Débitos Estaduais (SEFAZ-PE)',
        issuer: 'Secretaria da Fazenda de Pernambuco',
        number: 'SEFAZ-PE-884412',
        issueDate: '2026-05-18',
        expiryDate: '2026-11-14',
        portalUrl: 'https://efisco.sefaz.pe.gov.br',
        verificationCode: 'SEF-8844-PE',
        mandatory: true
      },
      {
        id: 'cnd-vs-municipal',
        type: CND_TYPES.MUNICIPAL,
        title: 'Certidão Negativa Cabo de Santo Agostinho',
        issuer: 'Secretaria Municipal de Finanças - Cabo de Santo Agostinho',
        number: 'CSA-2026-9011',
        issueDate: '2026-08-10',
        expiryDate: '2027-02-06',
        portalUrl: 'https://cabo.pe.gov.br/tributos',
        verificationCode: 'CSA-9011-2026',
        mandatory: true
      },
      {
        id: 'cnd-vs-falencia',
        type: CND_TYPES.FALENCIA,
        title: 'Certidão Negativa de Falência e Recuperação Judicial',
        issuer: 'Tribunal de Justiça de Pernambuco (TJPE)',
        number: 'TJPE-DIST-2026-4412',
        issueDate: '2026-08-15',
        expiryDate: '2026-11-15',
        portalUrl: 'https://www.tjpe.jus.br/certidaoonline',
        verificationCode: 'TJPE-DIST-4412',
        mandatory: true
      },
      {
        id: 'cnd-vs-crea',
        type: CND_TYPES.CREA,
        title: 'Certidão de Registro de Pessoa Jurídica (CREA)',
        issuer: 'Conselho Regional de Engenharia e Agronomia (CREA-PE)',
        number: 'CREA-PE-058190/D',
        issueDate: '2026-01-20',
        expiryDate: '2027-03-31',
        portalUrl: 'https://crea-pe.sitac.com.br',
        verificationCode: 'CREA-058190-2026',
        mandatory: true
      }
    ]
  }
};

class CndMonitoringService {
  constructor() {
    this.data = this.loadData();
    this.startPeriodicScan();
  }

  loadData() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY_CNDS);
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[CndMonitoringService] Erro ao carregar CNDs:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_CNDS_DATA));
  }

  saveData() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY_CNDS, JSON.stringify(this.data));
      }
    } catch (e) {
      console.warn('[CndMonitoringService] Erro ao salvar CNDs:', e);
    }
  }

  /**
   * Calcula dias restantes e status de uma certidão
   */
  calculateStatus(expiryDateStr) {
    if (!expiryDateStr) return { daysLeft: 0, status: CND_STATUS.EXPIRED };
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parts = expiryDateStr.split('-');
    const expiry = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return { daysLeft, status: CND_STATUS.EXPIRED };
    } else if (daysLeft <= 15) {
      return { daysLeft, status: CND_STATUS.EXPIRING };
    }
    return { daysLeft, status: CND_STATUS.REGULAR };
  }

  /**
   * Obtém a lista enriquecida com status em tempo real de uma empresa
   */
  getCompanyCertificates(companyKey = 'excelencia-ambiental') {
    const key = (companyKey || '').toLowerCase().includes('veeluen') ? 'veeluen-solutions' : 'excelencia-ambiental';
    const comp = this.data[key] || this.data['excelencia-ambiental'];

    const enrichedCertificates = comp.certificates.map(cert => {
      const calc = this.calculateStatus(cert.expiryDate);
      return {
        ...cert,
        daysLeft: calc.daysLeft,
        status: calc.status
      };
    });

    const expiredCount = enrichedCertificates.filter(c => c.status === CND_STATUS.EXPIRED).length;
    const expiringCount = enrichedCertificates.filter(c => c.status === CND_STATUS.EXPIRING).length;

    let overallHealth = CND_STATUS.REGULAR;
    if (expiredCount > 0) overallHealth = CND_STATUS.EXPIRED;
    else if (expiringCount > 0) overallHealth = CND_STATUS.EXPIRING;

    return {
      companyId: comp.companyId,
      companyName: comp.companyName,
      cnpj: comp.cnpj,
      certificates: enrichedCertificates,
      overallHealth,
      expiredCount,
      expiringCount,
      totalCount: enrichedCertificates.length,
      isEligibleForBidding: expiredCount === 0
    };
  }

  /**
   * Atualiza a validade de uma certidão
   */
  updateCertificate(companyKey, certId, { expiryDate, issueDate, number, verificationCode }) {
    const key = (companyKey || '').toLowerCase().includes('veeluen') ? 'veeluen-solutions' : 'excelencia-ambiental';
    const comp = this.data[key];
    if (!comp) return null;

    const certIndex = comp.certificates.findIndex(c => c.id === certId);
    if (certIndex === -1) return null;

    comp.certificates[certIndex] = {
      ...comp.certificates[certIndex],
      expiryDate: expiryDate || comp.certificates[certIndex].expiryDate,
      issueDate: issueDate || comp.certificates[certIndex].issueDate,
      number: number || comp.certificates[certIndex].number,
      verificationCode: verificationCode || comp.certificates[certIndex].verificationCode
    };

    this.saveData();
    logService.addLog(LogType.AUDIT, `CND Atualizada: ${comp.certificates[certIndex].title} para a empresa ${comp.companyName}.`);
    EventBus.emit('vellia-cnds-updated', { companyKey: key });
    return comp.certificates[certIndex];
  }

  /**
   * Verifica se há certidões vencendo em menos de 10 dias e dispara alertas preventivos
   */
  scanAndAlert() {
    const companies = ['excelencia-ambiental', 'veeluen-solutions'];
    let alertsTriggered = 0;

    companies.forEach(key => {
      const info = this.getCompanyCertificates(key);
      info.certificates.forEach(cert => {
        if (cert.status === CND_STATUS.EXPIRING && cert.daysLeft <= 10) {
          const alertTitle = `CND em Risco de Vencimento: ${cert.title} (${cert.daysLeft} dias restantes)`;
          const alertDesc = `A certidão ${cert.title} da ${info.companyName} vence em ${cert.daysLeft} dia(s) (${cert.expiryDate}). Renove com urgência para evitar inabilitação fiscal.`;

          alertService.createAlert({
            title: alertTitle,
            message: alertDesc,
            level: cert.daysLeft <= 3 ? 'CRITICAL' : 'WARNING',
            type: 'CND_EXPIRING',
            opportunityId: null,
            metadata: { certId: cert.id, companyId: key, expiryDate: cert.expiryDate, portalUrl: cert.portalUrl }
          });

          alertsTriggered++;
        } else if (cert.status === CND_STATUS.EXPIRED) {
          alertService.createAlert({
            title: `🚨 BLOQUEIO FISCAL: CND Vencida (${cert.title})`,
            message: `A certidão ${cert.title} da ${info.companyName} está VENCIDA (${cert.daysLeft} dias). A empresa está IMPEDIDA de habilitar em novos certames.`,
            level: 'CRITICAL',
            type: 'CND_EXPIRED',
            opportunityId: null,
            metadata: { certId: cert.id, companyId: key, portalUrl: cert.portalUrl }
          });
          alertsTriggered++;
        }
      });
    });

    return alertsTriggered;
  }

  /**
   * Inicia varredura periódica a cada 4 horas
   */
  startPeriodicScan() {
    // Executa varredura inicial suave após 3 segundos
    setTimeout(() => {
      this.scanAndAlert();
    }, 3000);

    setInterval(() => {
      this.scanAndAlert();
    }, 1000 * 60 * 60 * 4);
  }

  /**
   * Restaura os valores padrão de teste
   */
  resetToDefaults() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_CNDS_DATA));
    this.saveData();
    EventBus.emit('vellia-cnds-updated', {});
    return this.data;
  }
}

export const cndMonitoringService = new CndMonitoringService();
export default cndMonitoringService;
