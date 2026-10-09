import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Compass, 
  FileCheck, 
  Users, 
  ShieldAlert, 
  Sparkles,
  Layers
} from 'lucide-react';
import './RoleOnboardingModal.css';

const ROLE_CHECKLISTS = {
  LICITACOES: {
    title: 'Onboarding do Usuário de Licitações',
    badge: 'Operação de Editais',
    description: 'Guia essencial para triagem, validação de oportunidades e submissão de propostas competitivas.',
    icon: Compass,
    color: '#00e5c9',
    steps: [
      { id: 'l1', title: 'Radar de Oportunidades Diário', desc: 'Acesse o Radar Diário gerado às 06:00 pelo Vellia Agent para conferir editais do PNCP e Petronect.' },
      { id: 'l2', title: 'Validação de Aderência Humana', desc: 'Avalie as oportunidades como Correto, Parcial ou Incorreto para calibrar a precisão sem alterar o motor.' },
      { id: 'l3', title: 'Fluxo Estratégico GO / NO-GO', desc: 'Utilize o Decision Board para registrar a decisão colegiada e critérios de viabilidade do certame.' },
      { id: 'l4', title: 'Elaboração e Fechamento de Proposta', desc: 'Acompanhe a precificação, anexos do edital e checklist de habilitação no módulo de Propostas.' }
    ]
  },
  TECNICO: {
    title: 'Onboarding do Usuário Técnico / Engenharia',
    badge: 'Qualificação Técnica',
    description: 'Guia para homologação de atestados de capacidade técnica, CATs/ARTs e conformidade de escopo.',
    icon: FileCheck,
    color: '#38bdf8',
    steps: [
      { id: 't1', title: 'Análise Profunda do Edital & TR', desc: 'Abra a visualização analítica para checar exigências de parcelas de maior relevância técnica.' },
      { id: 't2', title: 'Acervo de Atestados no Vault', desc: 'Consulte os atestados da Excelência Ambiental e Veeluen Solutions salvos com indexação semântica.' },
      { id: 't3', title: 'Vínculo de ARTs e Responsabilidade', desc: 'Verifique profissionais indicados no quadro técnico e compatibilidade com o objeto licitado.' },
      { id: 't4', title: 'Parecer de Capacidade Operacional', desc: 'Emita o parecer técnico que embasa a decisão de GO ou consórcio com outras empresas.' }
    ]
  },
  COMERCIAL: {
    title: 'Onboarding do Usuário Comercial / Gestão',
    badge: 'Estratégia & B2G',
    description: 'Guia para inteligência preditiva, funil de relacionamento governamental e previsão de receita.',
    icon: Users,
    color: '#a855f7',
    steps: [
      { id: 'c1', title: 'Radar Antecipado & Predição de Contratos', desc: 'Identifique renovações contratuais e audiências públicas antes da publicação oficial do edital.' },
      { id: 'c2', title: 'Gestão de Relacionamento (CRM B2G)', desc: 'Organize contatos de pregoeiros, órgãos demandantes e histórico de interações institucionais.' },
      { id: 'c3', title: 'Follow-ups e Comunicações Assistidas', desc: 'Acompanhe e-mails de esclarecimentos e diligências com templates assistidos.' },
      { id: 'c4', title: 'Command Center & Metas de Win Rate', desc: 'Monitore o pipeline executivo, previsão de faturamento e taxa de conversão em tempo real.' }
    ]
  },
  ADMINISTRADOR: {
    title: 'Onboarding do Administrador do Sistema',
    badge: 'Governança & Segurança',
    description: 'Guia para operação de infraestrutura, auditoria imutável, rotinas de backup e aprovação do Go-Live.',
    icon: ShieldAlert,
    color: '#f59e0b',
    steps: [
      { id: 'a1', title: 'Monitoramento de Conectores & Fontes', desc: 'Cheque a integridade das integrações PNCP, Compras.gov e Petronect no painel de observabilidade.' },
      { id: 'a2', title: 'Gestão de Usuários e Matriz RBAC', desc: 'Gerencie credenciais, sessões ativas e escopos isolados de dados entre as duas empresas.' },
      { id: 'a3', title: 'Auditoria Geral LGPD e Logs', desc: 'Verifique a trilha de auditoria com diff de alterações e controle de acesso a dados sensíveis.' },
      { id: 'a4', title: 'Aprovação de Produção & Disaster Recovery', desc: 'Valide o checklist de bloqueadores e assine formalmente a transição consciente de Go-Live.' }
    ]
  }
};

export default function RoleOnboardingModal({ isOpen, onClose, initialRole = 'LICITACOES', onNavigate = null }) {
  const [selectedRoleKey, setSelectedRoleKey] = useState(initialRole);
  const [completedSteps, setCompletedSteps] = useState({});

  if (!isOpen) return null;

  const currentRoleConfig = ROLE_CHECKLISTS[selectedRoleKey] || ROLE_CHECKLISTS.LICITACOES;
  const RoleIcon = currentRoleConfig.icon;

  const toggleStep = (stepId) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const handleFinish = () => {
    onClose();
  };

  return (
    <div className="onboarding-modal-overlay" onClick={onClose}>
      <div className="onboarding-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Cabeçalho */}
        <div className="onboarding-header">
          <div className="onboarding-header-left">
            <div className="role-avatar-badge" style={{ background: `${currentRoleConfig.color}20`, color: currentRoleConfig.color, borderColor: `${currentRoleConfig.color}40` }}>
              <RoleIcon size={24} />
            </div>
            <div>
              <div className="onboarding-badge-row">
                <span className="role-pill" style={{ color: currentRoleConfig.color }}>{currentRoleConfig.badge}</span>
                <span className="role-ver">Vellia Licitações v2.2</span>
              </div>
              <h2 className="onboarding-title">{currentRoleConfig.title}</h2>
              <p className="onboarding-desc">{currentRoleConfig.description}</p>
            </div>
          </div>
          <button className="onboarding-close-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        {/* Alternador de Perfil para Demonstração Interativa */}
        <div className="role-selector-bar">
          <span className="role-sel-label">Visualizar Checklist do Perfil:</span>
          <div className="role-tabs-row">
            {Object.keys(ROLE_CHECKLISTS).map((rk) => (
              <button
                key={rk}
                className={`role-tab-btn ${selectedRoleKey === rk ? 'active' : ''}`}
                onClick={() => setSelectedRoleKey(rk)}
              >
                {rk === 'LICITACOES' && 'Licitações'}
                {rk === 'TECNICO' && 'Técnico'}
                {rk === 'COMERCIAL' && 'Comercial'}
                {rk === 'ADMINISTRADOR' && 'Administrador'}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Passos do Perfil */}
        <div className="onboarding-steps-container">
          <div className="steps-header">
            <h4>Jornada Recomendada no Piloto Real</h4>
            <span className="steps-progress-text">
              {currentRoleConfig.steps.filter(s => completedSteps[s.id]).length} de {currentRoleConfig.steps.length} concluídos
            </span>
          </div>

          <div className="steps-list">
            {currentRoleConfig.steps.map((step, idx) => {
              const isDone = Boolean(completedSteps[step.id]);
              return (
                <div
                  key={step.id}
                  className={`step-card ${isDone ? 'step-done' : ''}`}
                  onClick={() => toggleStep(step.id)}
                >
                  <div className="step-card-left">
                    <button type="button" className="step-check-btn" aria-label="Concluir passo">
                      {isDone ? (
                        <CheckCircle2 size={20} className="check-icon-active" />
                      ) : (
                        <Circle size={20} className="check-icon-empty" />
                      )}
                    </button>
                    <div className="step-number-pill">{idx + 1}</div>
                    <div className="step-content">
                      <h5 className="step-title">{step.title}</h5>
                      <p className="step-text">{step.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="onboarding-footer">
          <div className="footer-tip">
            <Sparkles size={14} className="tip-icon" />
            <span>Você pode reabrir este guia a qualquer momento no menu de Ajuda e Suporte.</span>
          </div>
          <button className="btn-finish-onboarding" onClick={handleFinish}>
            <span>Começar Operação Assistida</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
