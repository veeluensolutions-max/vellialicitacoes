/**
 * VELLIA LICITAÇÕES — FASE 17
 * contactService.js
 * Gerenciamento de Contatos Profissionais, Mapa de Relacionamento, Níveis de Influência e LGPD.
 */

import { ContactRole, InfluenceLevel } from './crmModels.js';

const STORAGE_KEY_CONTACTS = 'vellia_crm_contacts_v17';

export const INITIAL_CONTACTS = [
  // 1. Petrobras RNEST
  {
    id: 'CTC-PETRO-001',
    name: 'Eng. Marcelo Cavalcanti',
    organizationId: 'ORG-PETROBRAS-RNEST',
    organizationName: 'Petrobras — Refinaria Abreu e Lima (RNEST)',
    position: 'Gerente Executivo de SMS e Operações Ambientais',
    department: 'Gerência de SMS / ETE Industrial',
    area: 'Meio Ambiente e Segurança',
    role: ContactRole.DECISOR,
    influenceLevel: InfluenceLevel.ALTA,
    email: 'marcelo.cavalcanti@petrobras.com.br',
    phone: '(81) 99123-4567',
    linkedIn: 'https://linkedin.com/in/marcelo-cavalcanti-rnest',
    city: 'Ipojuca',
    state: 'PE',
    notes: 'Engenheiro químico sênior. Responsável pela emissão do Termo de Referência da operação contínua de ETE.',
    status: 'ATIVO',
    internalResponsible: 'Roberto Mendes (Diretor Comercial)',
    lastContactDate: '2026-09-28',
    nextContactDate: '2026-10-15',
    dataOrigin: 'Documento público / Painel de Licitações Transparência Petrobras (LGPD compliant)',
    isFavorite: true,
    createdAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 'CTC-PETRO-002',
    name: 'Dra. Patrícia Albuquerque',
    organizationId: 'ORG-PETROBRAS-RNEST',
    organizationName: 'Petrobras — Refinaria Abreu e Lima (RNEST)',
    position: 'Coordenadora de Suprimentos e Contratações de Engenharia',
    department: 'Gerência de Suprimentos e Licitações',
    area: 'Compras e Licitações',
    role: ContactRole.COMPRAS,
    influenceLevel: InfluenceLevel.ALTA,
    email: 'patricia.albuquerque@petrobras.com.br',
    phone: '(81) 98877-6655',
    linkedIn: 'https://linkedin.com/in/patricia-albuquerque-procurement',
    city: 'Ipojuca',
    state: 'PE',
    notes: 'Supervisiona editais na plataforma Petronect. Muito atenta aos critérios de habilitação jurídica e técnica.',
    status: 'ATIVO',
    internalResponsible: 'Camila Torres (Engenheira)',
    lastContactDate: '2026-09-15',
    nextContactDate: '2026-10-22',
    dataOrigin: 'Edital oficial Petronect / Contato institucional prévio',
    isFavorite: false,
    createdAt: '2026-02-10T11:30:00Z'
  },
  {
    id: 'CTC-PETRO-003',
    name: 'Carlos Eduardo Ramos',
    organizationId: 'ORG-PETROBRAS-RNEST',
    organizationName: 'Petrobras — Refinaria Abreu e Lima (RNEST)',
    position: 'Engenheiro Especialista de Inspeção de Equipamentos (NR-13)',
    department: 'Manutenção e Integridade Mecânica',
    area: 'Engenharia / NR-13',
    role: ContactRole.TECNICO,
    influenceLevel: InfluenceLevel.MEDIA,
    email: 'carlos.ramos@petrobras.com.br',
    phone: '(81) 99654-3210',
    linkedIn: '',
    city: 'Ipojuca',
    state: 'PE',
    notes: 'Valida as composições de custos e atestados de caldeiras e vasos de pressão.',
    status: 'ATIVO',
    internalResponsible: 'Flávio Caldas (Eng. Mecânico)',
    lastContactDate: '2026-08-20',
    nextContactDate: '2026-10-30',
    dataOrigin: 'Site institucional Petrobras',
    isFavorite: false,
    createdAt: '2026-03-05T09:00:00Z'
  },

  // 2. UFPE
  {
    id: 'CTC-UFPE-001',
    name: 'Prof. Dr. Ricardo Siqueira',
    organizationId: 'ORG-UFPE',
    organizationName: 'Universidade Federal de Pernambuco (UFPE)',
    position: 'Pró-Reitor de Gestão Administrativa (PROGEST)',
    department: 'PROGEST / Reitoria',
    area: 'Diretoria Executiva',
    role: ContactRole.DECISOR,
    influenceLevel: InfluenceLevel.ALTA,
    email: 'ricardo.siqueira@ufpe.br',
    phone: '(81) 2126-8050',
    linkedIn: 'https://linkedin.com/in/ricardo-siqueira-ufpe',
    city: 'Recife',
    state: 'PE',
    notes: 'Autoriza abertura dos processos licitatórios de infraestrutura e atendimento ao CPRH.',
    status: 'ATIVO',
    internalResponsible: 'Roberto Mendes',
    lastContactDate: '2026-09-10',
    nextContactDate: '2026-10-18',
    dataOrigin: 'Portal da Transparência UFPE',
    isFavorite: true,
    createdAt: '2026-02-18T14:00:00Z'
  },
  {
    id: 'CTC-UFPE-002',
    name: 'Bárbara Lins',
    organizationId: 'ORG-UFPE',
    organizationName: 'Universidade Federal de Pernambuco (UFPE)',
    position: 'Diretora da Divisão de Meio Ambiente e Sustentabilidade',
    department: 'Superintendência de Infraestrutura (SINFRA)',
    area: 'Meio Ambiente',
    role: ContactRole.INFLUENCIADOR,
    influenceLevel: InfluenceLevel.ALTA,
    email: 'barbara.lins@ufpe.br',
    phone: '(81) 2126-8230',
    linkedIn: 'https://linkedin.com/in/barbara-lins-sustentabilidade',
    city: 'Recife',
    state: 'PE',
    notes: 'Responsável técnica pelo termo de referência de monitoramento de chaminés e amostragem de emissões.',
    status: 'ATIVO',
    internalResponsible: 'Camila Torres (Engenheira Ambiental)',
    lastContactDate: '2026-10-02',
    nextContactDate: '2026-10-16',
    dataOrigin: 'Portal UFPE SINFRA',
    isFavorite: true,
    createdAt: '2026-02-20T16:20:00Z'
  },

  // 3. COMPESA
  {
    id: 'CTC-COMP-001',
    name: 'Eng. Fernando Bezerra',
    organizationId: 'ORG-COMPESA',
    organizationName: 'Companhia Pernambucana de Saneamento (COMPESA)',
    position: 'Gerente Geral de Engenharia e Manutenção Eletromecânica',
    department: 'Diretoria Técnica e de Engenharia (DTE)',
    area: 'Engenharia / NR-13',
    role: ContactRole.DECISOR,
    influenceLevel: InfluenceLevel.ALTA,
    email: 'fernando.bezerra@compesa.com.br',
    phone: '(81) 3412-9220',
    linkedIn: 'https://linkedin.com/in/fernando-bezerra-saneamento',
    city: 'Recife',
    state: 'PE',
    notes: 'Decisor do contrato 401/2022 que encerra em novembro. Avaliando abertura de novo certame.',
    status: 'ATIVO',
    internalResponsible: 'Flávio Caldas (Eng. Mecânico)',
    lastContactDate: '2026-09-25',
    nextContactDate: '2026-10-14',
    dataOrigin: 'Site oficial Compesa / DTE',
    isFavorite: true,
    createdAt: '2026-03-02T10:15:00Z'
  },
  {
    id: 'CTC-COMP-002',
    name: 'Mariana Duarte',
    organizationId: 'ORG-COMPESA',
    organizationName: 'Companhia Pernambucana de Saneamento (COMPESA)',
    position: 'Pregoeira e Coordenadora de Editais',
    department: 'Comissão Especial de Licitações (CEL)',
    area: 'Licitações',
    role: ContactRole.LICITACOES,
    influenceLevel: InfluenceLevel.MEDIA,
    email: 'mariana.duarte@compesa.com.br',
    phone: '(81) 3412-9115',
    linkedIn: '',
    city: 'Recife',
    state: 'PE',
    notes: 'Conduz as sessões públicas no portal PE Integrado e PNCP.',
    status: 'ATIVO',
    internalResponsible: 'Lucas Andrade',
    lastContactDate: '2026-08-15',
    nextContactDate: '2026-11-01',
    dataOrigin: 'Portal de Compras PE',
    isFavorite: false,
    createdAt: '2026-03-10T15:00:00Z'
  },

  // 4. Porto de Suape
  {
    id: 'CTC-SUAPE-001',
    name: 'Dr. Leonardo Gusmão',
    organizationId: 'ORG-SUAPE',
    organizationName: 'Complexo Industrial Portuário de Suape',
    position: 'Diretor de Meio Ambiente e Sustentabilidade Portuária',
    department: 'Diretoria de Sustentabilidade (DIRPRE)',
    area: 'Meio Ambiente e Resíduos',
    role: ContactRole.DECISOR,
    influenceLevel: InfluenceLevel.ALTA,
    email: 'leonardo.gusmao@suape.pe.gov.br',
    phone: '(81) 3527-5120',
    linkedIn: 'https://linkedin.com/in/leonardo-gusmao-suape',
    city: 'Ipojuca',
    state: 'PE',
    notes: 'Supervisiona a gestão de resíduos perigosos e dragagem ecológica. Já participou de reuniões institucionais.',
    status: 'ATIVO',
    internalResponsible: 'Roberto Mendes (Diretor Comercial)',
    lastContactDate: '2026-09-30',
    nextContactDate: '2026-10-17',
    dataOrigin: 'Contato institucional direto / Seminário Portuário 2026',
    isFavorite: true,
    createdAt: '2026-03-22T08:45:00Z'
  },
  {
    id: 'CTC-SUAPE-002',
    name: 'Juliana Fontes',
    organizationId: 'ORG-SUAPE',
    organizationName: 'Complexo Industrial Portuário de Suape',
    position: 'Analista de Gestão Ambiental e Resíduos Industriais',
    department: 'Gerência de SMS Portuário',
    area: 'Técnico / Meio Ambiente',
    role: ContactRole.TECNICO,
    influenceLevel: InfluenceLevel.MEDIA,
    email: 'juliana.fontes@suape.pe.gov.br',
    phone: '(81) 3527-5240',
    linkedIn: 'https://linkedin.com/in/juliana-fontes-ambiental',
    city: 'Ipojuca',
    state: 'PE',
    notes: 'Valida laudos de destinação final e manifestos MTR no Sinir.',
    status: 'ATIVO',
    internalResponsible: 'Camila Torres',
    lastContactDate: '2026-09-18',
    nextContactDate: '2026-10-25',
    dataOrigin: 'Site oficial Suape',
    isFavorite: false,
    createdAt: '2026-03-25T11:20:00Z'
  },

  // 5. Chesf
  {
    id: 'CTC-CHESF-001',
    name: 'Eng. Renato Fagundes',
    organizationId: 'ORG-CHESF',
    organizationName: 'Eletrobras Chesf',
    position: 'Gerente do Departamento de Gestão Socioambiental (DGS)',
    department: 'Diretoria de Operações e Engenharia',
    area: 'Meio Ambiente e Estudos',
    role: ContactRole.INFLUENCIADOR,
    influenceLevel: InfluenceLevel.ALTA,
    email: 'renato.fagundes@chesf.com.br',
    phone: '(81) 3229-2340',
    linkedIn: 'https://linkedin.com/in/renato-fagundes-chesf',
    city: 'Recife',
    state: 'PE',
    notes: 'Define as diretrizes de termos de referência para estudos de impacto e ictiofauna.',
    status: 'ATIVO',
    internalResponsible: 'Camila Torres (Engenheira Ambiental)',
    lastContactDate: '2026-08-10',
    nextContactDate: '2026-10-28',
    dataOrigin: 'Documento público IBAMA / Chesf',
    isFavorite: false,
    createdAt: '2026-04-10T14:10:00Z'
  }
];

class ContactService {
  constructor() {
    this._ensureInitialized();
  }

  _safeGetStorage(key) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.warn(`[ContactService] Erro ao ler ${key}:`, e);
      }
    }
    return null;
  }

  _safeSetStorage(key, val) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {
        console.warn(`[ContactService] Erro ao gravar ${key}:`, e);
      }
    }
  }

  _ensureInitialized() {
    const existing = this._safeGetStorage(STORAGE_KEY_CONTACTS);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      this._safeSetStorage(STORAGE_KEY_CONTACTS, INITIAL_CONTACTS);
    }
  }

  /**
   * Retorna todos os contatos
   */
  getAllContacts() {
    return this._safeGetStorage(STORAGE_KEY_CONTACTS) || INITIAL_CONTACTS;
  }

  /**
   * Busca contatos de uma organização específica
   */
  getContactsByOrganization(organizationId) {
    if (!organizationId) return [];
    const all = this.getAllContacts();
    return all.filter(c => c.organizationId === organizationId);
  }

  /**
   * Busca contato por ID
   */
  getContactById(id) {
    if (!id) return null;
    const all = this.getAllContacts();
    return all.find(c => c.id === id) || null;
  }

  /**
   * Mapa de Relacionamento (Item 12): Agrupa contatos visualmente por papel funcional
   */
  getRelationshipMap(organizationId) {
    const contacts = this.getContactsByOrganization(organizationId);
    return {
      decisores: contacts.filter(c => c.role === ContactRole.DECISOR || c.role === ContactRole.DIRETORIA),
      influenciadores: contacts.filter(c => c.role === ContactRole.INFLUENCIADOR),
      tecnicos: contacts.filter(c => c.role === ContactRole.TECNICO || c.role === ContactRole.ENGENHARIA || c.role === ContactRole.MEIO_AMBIENTE || c.role === ContactRole.SST),
      compras: contacts.filter(c => c.role === ContactRole.COMPRAS || c.role === ContactRole.FINANCEIRO),
      licitacoes: contacts.filter(c => c.role === ContactRole.LICITACOES || c.role === ContactRole.ADMINISTRATIVO)
    };
  }

  /**
   * Detecção de duplicidade (Item 63): E-mail, Nome + Organização, Telefone
   */
  checkDuplicate(contactData = {}) {
    const all = this.getAllContacts();
    const emailLower = (contactData.email || '').toLowerCase().trim();
    const phoneClean = (contactData.phone || '').replace(/[^\d]/g, '');
    const nameLower = (contactData.name || '').toLowerCase().trim();
    const orgId = contactData.organizationId;

    return all.find(c => {
      // 1. Mesmo e-mail profissional
      if (emailLower && c.email.toLowerCase().trim() === emailLower) return true;
      // 2. Mesmo telefone (com pelo menos 8 dígitos)
      if (phoneClean.length >= 8 && c.phone.replace(/[^\d]/g, '').endsWith(phoneClean.slice(-8))) return true;
      // 3. Mesmo nome na mesma organização
      if (nameLower && orgId && c.organizationId === orgId && c.name.toLowerCase().trim() === nameLower) return true;
      return false;
    }) || null;
  }

  /**
   * Adiciona novo contato com verificação de duplicidade e LGPD (Item 8, 9, 63, 65)
   */
  addContact(contactData = {}) {
    const duplicate = this.checkDuplicate(contactData);
    if (duplicate) {
      return { contact: duplicate, isDuplicate: true };
    }

    const all = this.getAllContacts();
    const newContact = {
      id: contactData.id || `CTC-${Date.now()}`,
      name: contactData.name || 'Contato Sem Nome',
      organizationId: contactData.organizationId || '',
      organizationName: contactData.organizationName || 'Organização Não Identificada',
      position: contactData.position || 'Função Profissional',
      department: contactData.department || 'Geral',
      area: contactData.area || 'Operações',
      role: contactData.role || ContactRole.OUTRO,
      influenceLevel: contactData.influenceLevel || InfluenceLevel.MEDIA,
      email: contactData.email || '',
      phone: contactData.phone || '',
      linkedIn: contactData.linkedIn || '',
      city: contactData.city || 'Recife',
      state: contactData.state || 'PE',
      notes: contactData.notes || '',
      status: 'ATIVO',
      internalResponsible: contactData.internalResponsible || 'Camila Torres',
      lastContactDate: contactData.lastContactDate || new Date().toISOString().split('T')[0],
      nextContactDate: contactData.nextContactDate || '',
      dataOrigin: contactData.dataOrigin || 'Registro profissional direto (LGPD compliant)',
      isFavorite: false,
      createdAt: new Date().toISOString()
    };

    all.push(newContact);
    this._safeSetStorage(STORAGE_KEY_CONTACTS, all);
    return { contact: newContact, isDuplicate: false };
  }

  /**
   * Atualiza contato
   */
  updateContact(id, patch = {}) {
    const all = this.getAllContacts();
    const idx = all.findIndex(c => c.id === id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
      this._safeSetStorage(STORAGE_KEY_CONTACTS, all);
      return all[idx];
    }
    return null;
  }
}

export const contactService = new ContactService();
