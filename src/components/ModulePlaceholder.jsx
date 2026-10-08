import React from 'react';
import { 
  Building2, 
  Wrench, 
  Radio, 
  Compass, 
  FileText, 
  Bell, 
  BarChart3, 
  Settings, 
  Layers, 
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import './ModulePlaceholder.css';

export default function ModulePlaceholder({ moduleId, onBackToDashboard }) {
  const moduleConfig = {
    oportunidades: {
      title: 'Banco de Oportunidades',
      phase: 'FASE 5',
      desc: 'Central unificada de editais públicos com filtros multidimensionais por portal, status de habilitação, prazo e valor.',
      icon: Compass,
      highlights: ['Filtragem por modalidade e estado', 'Gestão de funil de oportunidades', 'Histórico de versões do edital']
    },
    monitoramento: {
      title: 'Monitoramento Petronect & Portais',
      phase: 'FASE 7',
      desc: 'Módulo de varredura automatizada com captura de oportunidades públicas, controle de sincronização e telemetria.',
      icon: Radio,
      highlights: ['Captura pública Petronect', 'Controle de periodicidade e logs', 'Arquitetura preparada para PNCP e Compras.gov']
    },
    empresas: {
      title: 'Cadastro de Empresas Participantes',
      phase: 'FASE 2',
      desc: 'Perfis técnicos completos para Veeluen Solutions, Excelência Ambiental e novas empresas da família Vellia.',
      icon: Building2,
      highlights: ['Dados cadastrais e registros CREA', 'Responsáveis técnicos e capacidades', 'Regiões de atendimento e certidões']
    },
    servicos: {
      title: 'Catálogo Estruturado de Serviços',
      phase: 'FASE 3',
      desc: 'Mapeamento semântico dos serviços especializados com sinônimos de editais e expressões técnicas.',
      icon: Wrench,
      highlights: ['11 Serviços Excelência Ambiental', '18 Serviços Veeluen Solutions', 'Matriz de equivalência terminológica']
    },
    documentos: {
      title: 'Gestão de Documentos & Certidões',
      phase: 'FASE 10',
      desc: 'Repositório inteligente de habilitação jurídica, fiscal, técnica e monitoramento contínuo de vencimentos.',
      icon: FileText,
      highlights: ['Controle de validade de certidões', 'Atestados de capacidade técnica', 'Documentação dos responsáveis técnicos']
    },
    alertas: {
      title: 'Central de Alertas Inteligentes',
      phase: 'FASE 9',
      desc: 'Regras personalizadas de notificação em tempo real por aderência mínima, prazo crítico ou palavra-chave.',
      icon: Bell,
      highlights: ['Gatilhos por pontuação semântica', 'Canais de aviso imediato', 'Filtragem por estado e região']
    },
    relatorios: {
      title: 'Radar Diário & Relatórios Executivos',
      phase: 'FASE 14',
      desc: 'Sínteses executivas diárias e indicadores consolidados de desempenho comercial e conversão.',
      icon: BarChart3,
      highlights: ['Relatório matinal consolidado', 'Taxa de aderência por portal', 'Oportunidades prioritárias do dia']
    },
    configuracoes: {
      title: 'Configurações do Vellia Licitações',
      phase: 'SISTEMA',
      desc: 'Parâmetros de operação do agente, sensibilidade do motor de aderência e preferências do usuário.',
      icon: Settings,
      highlights: ['Frequência de monitoramento', 'Pesos do cálculo de aderência', 'Gestão de acessos da equipe']
    }
  };

  const curr = moduleConfig[moduleId] || {
    title: 'Módulo do Sistema',
    phase: 'EM EVOLUÇÃO',
    desc: 'Estrutura base pronta para integração conforme as fases do projeto.',
    icon: Layers,
    highlights: ['Arquitetura modular preservada']
  };

  const Icon = curr.icon;

  return (
    <div className="placeholder-container">
      <div className="placeholder-card">
        <div className="placeholder-badge-row">
          <span className="placeholder-phase-badge">{curr.phase}</span>
          <span className="placeholder-status-badge">
            <span className="p-dot" /> Arquitetura Preparada
          </span>
        </div>

        <div className="placeholder-icon-wrap">
          <Icon size={36} />
        </div>

        <h2 className="placeholder-title">{curr.title}</h2>
        <p className="placeholder-desc">{curr.desc}</p>

        <div className="placeholder-highlights-block">
          <h4 className="placeholder-hl-title">Recursos mapeados para a fase:</h4>
          <ul className="placeholder-hl-list">
            {curr.highlights.map((h, i) => (
              <li key={i} className="placeholder-hl-item">
                <CheckCircle2 size={15} className="hl-check" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="placeholder-note">
          <Sparkles size={14} className="note-sparkle" />
          <span>
            A Fase 1 estabelece a base e o <strong>Dashboard Principal</strong>. Este módulo será ativado sem alterar a estrutura do sistema.
          </span>
        </div>

        <button className="btn-back-dashboard" onClick={onBackToDashboard}>
          <span>Retornar ao Dashboard</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
