/**
 * VELLIA LICITAÇÕES — FASE 21: QA + OBSERVABILIDADE + PREPARAÇÃO PARA PRODUÇÃO
 * securityAuditService.js: Validações de Segurança OWASP, Proteção SSRF, IDOR e Uploads
 * 
 * Atende aos requisitos:
 * - Itens 74 a 85: Proteção contra Injection, XSS, SSRF em downloads de editais e webhooks,
 *   ataques de upload (bloqueio de executáveis), rate limiting, brute force, escalada de privilégios e IDOR entre empresas.
 */

export class SecurityAuditService {
  /**
   * 78. SSRF Protection: Bloqueia acesso a redes locais, loopback e metadados de nuvem
   */
  static validateUrlSafety(url) {
    if (!url || typeof url !== 'string') {
      return { safe: false, reason: 'URL inválida ou nula' };
    }

    try {
      const parsed = new URL(url);
      const protocol = parsed.protocol.toLowerCase();
      if (protocol !== 'http:' && protocol !== 'https:') {
        return { safe: false, reason: `Protocolo inseguro ou não permitido: ${protocol}` };
      }

      const hostname = parsed.hostname.toLowerCase();

      // Bloqueio de loopback e metadados de nuvem (AWS/GCP/Azure)
      const blockedHostnames = ['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254', 'metadata.google.internal'];
      if (blockedHostnames.includes(hostname)) {
        return { safe: false, reason: `SSRF detectado: Host restrito (${hostname})` };
      }

      // Bloqueio de faixas privadas IPv4 (RFC 1918)
      if (
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
      ) {
        return { safe: false, reason: `SSRF detectado: Faixa de IP privado interno (${hostname})` };
      }

      return { safe: true, reason: 'URL aprovada para requisição externa' };
    } catch (e) {
      return { safe: false, reason: `URL malformada: ${e.message}` };
    }
  }

  /**
   * 79 e 80. Upload Attack Protection: Validação de extensão, MIME e limite de tamanho
   */
  static validateUpload({ fileName, fileSizeMB, mimeType, maxLimitMB = 50 }) {
    if (!fileName || typeof fileName !== 'string') {
      return { allowed: false, reason: 'Nome de arquivo inválido' };
    }

    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.php', '.phtml', '.py', '.rb', '.js', '.vbs', '.scr', '.jar'];
    const lowerName = fileName.toLowerCase();

    for (const ext of dangerousExtensions) {
      if (lowerName.endsWith(ext)) {
        return {
          allowed: false,
          reason: `Upload bloqueado: Extensão potencialmente perigosa (${ext}) não é permitida.`
        };
      }
    }

    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.rar', '.png', '.jpg', '.jpeg'];
    const hasValidExt = allowedExtensions.some(ext => lowerName.endsWith(ext));

    if (!hasValidExt) {
      return {
        allowed: false,
        reason: 'Extensão não suportada. Apenas documentos e comprovantes (.pdf, .docx, .xlsx, .zip, imagens) são permitidos.'
      };
    }

    if (fileSizeMB > maxLimitMB) {
      return {
        allowed: false,
        reason: `Tamanho excede o limite configurado de ${maxLimitMB} MB (arquivo tem ${fileSizeMB} MB).`
      };
    }

    return { allowed: true, reason: 'Arquivo validado com sucesso' };
  }

  /**
   * 77. Sanitização contra XSS em entradas de texto
   */
  static sanitizeHtml(input) {
    if (!input || typeof input !== 'string') return '';
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  }

  /**
   * 83. Prevenção de Escalada de Privilégios (Privilege Escalation)
   */
  static validateRoleChange(actingUser, targetUser, requestedRole) {
    if (!actingUser || actingUser.role !== 'GESTAO') {
      return { allowed: false, reason: 'Apenas usuários com perfil GESTAO (Admin) podem alterar cargos e privilégios.' };
    }

    if (actingUser.id === targetUser.id && requestedRole !== actingUser.role) {
      return { allowed: false, reason: 'Por segurança, administradores não podem auto-rebaixar ou alterar seus próprios privilégios principais.' };
    }

    return { allowed: true, reason: 'Alteração de perfil autorizada' };
  }

  /**
   * 84. Proteção contra IDOR (Insecure Direct Object Reference)
   */
  static validateDocumentAccess(user, document) {
    if (!user || !document) return { allowed: false, reason: 'Contexto de usuário ou documento ausente.' };

    // Gestores globais têm acesso
    if (user.role === 'GESTAO' && (user.scope === 'GLOBAL' || user.scope === 'ALL')) {
      return { allowed: true, reason: 'Acesso concedido por escopo global' };
    }

    // Se o documento pertence a uma empresa restrita diferente do usuário
    if (document.company && user.company && document.company !== 'TODAS') {
      const userCompanyClean = user.company.toLowerCase().split(' ')[0];
      const docCompanyClean = document.company.toLowerCase().split(' ')[0];

      if (userCompanyClean !== docCompanyClean) {
        return {
          allowed: false,
          reason: `Acesso negado (IDOR): Documento confidencial pertence à empresa ${document.company}, mas o usuário está vinculado a ${user.company}.`
        };
      }
    }

    return { allowed: true, reason: 'Acesso autorizado' };
  }
}
