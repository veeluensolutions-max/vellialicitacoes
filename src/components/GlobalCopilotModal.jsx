import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  Layers,
  Search,
  ExternalLink
} from 'lucide-react';
import { OpportunityService } from '../services/opportunityService';
import { DecisionService } from '../services/decision/decisionService';
import { uxTelemetryService, UxEventType } from '../services/ux/uxTelemetryService';

export default function GlobalCopilotModal({ 
  isOpen, 
  onClose, 
  activeOpportunity, 
  currentModule = 'dashboard',
  onSelectOpportunity 
}) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Inicializa com contexto estruturado
  useEffect(() => {
    if (isOpen) {
      if (activeOpportunity) {
        setMessages([
          {
            sender: 'bot',
            structured: {
              resumo: `Contexto ativo: Edital #${activeOpportunity.id} (${activeOpportunity.client || 'Petrobras'}). Estou pronto para responder sobre conformidade técnica, prazos, riscos e diretrizes de envio.`,
              indicadores: [
                { label: 'Aderência', value: `${activeOpportunity.score || 94}%` },
                { label: 'Prazo', value: `${activeOpportunity.daysLeft || 3} dias` },
                { label: 'Estimativa', value: `R$ ${(activeOpportunity.estimatedValue || 2400000).toLocaleString('pt-BR')}` }
              ],
              pendencias: [
                'Revisar minuta de proposta técnica antes da submissão',
                'Verificar validade da CND Federal no Centro de Capacidade'
              ],
              recomendacao: 'GO COM PENDÊNCIAS — Viabilidade alta, restando apenas conferência cadastral.',
              fontes: 'Baseado em 4 registros do Vellia (Edital Petronect, Dossiê de Habilitação, Catálogo CAT/CREA e Matriz de Riscos).'
            },
            suggestions: [
              'Esse edital exige visita técnica obrigatória?',
              'Qual a qualificação técnica exigida neste edital?',
              'Qual a recomendação de GO / NO-GO para esta licitação?'
            ]
          }
        ]);
      } else {
        setMessages([
          {
            sender: 'bot',
            structured: {
              resumo: `Assistente Vellia em prontidão para o módulo ${currentModule.toUpperCase()}. Monitorando ativamente portais, certidões corporativas e pipeline de propostas.`,
              indicadores: [
                { label: 'Oportunidades em Radar', value: '14' },
                { label: 'Propostas em Andamento', value: '5' },
                { label: 'Certidões em Alerta', value: '1' }
              ],
              pendencias: [
                '1 proposta vence amanhã (Petrobras Bacia de Santos)',
                '1 certidão necessita renovação em 5 dias'
              ],
              recomendacao: 'Priorizar conferência da proposta com vencimento mais próximo.',
              fontes: 'Baseado em 5 registros do Vellia (Radar, Propostas, Certidões, Matriz e Histórico).'
            },
            suggestions: [
              'Quais editais vencem nos próximos 3 dias?',
              'Existem certidões ou documentos vencendo esta semana?',
              'Qual o status das propostas em elaboração?'
            ]
          }
        ]);
      }
    }
  }, [isOpen, activeOpportunity, currentModule]);

  if (!isOpen) return null;

  const handleSend = (textToSend) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    uxTelemetryService.recordEvent(
      UxEventType.COPILOT_QUERY,
      'GlobalCopilotModal',
      { hasContext: !!activeOpportunity, module: currentModule },
      1,
      450
    );

    setTimeout(() => {
      let structuredReply = null;
      const lower = query.toLowerCase();

      if (activeOpportunity) {
        if (lower.includes('visita') || lower.includes('técnica')) {
          structuredReply = {
            resumo: `Cláusula de Visita Técnica para o Edital #${activeOpportunity.id}: A vistoria é classificada como FACULTATIVA pelo contratante ${activeOpportunity.client || 'Petrobras'}.`,
            indicadores: [
              { label: 'Natureza', value: 'Facultativa' },
              { label: 'Alternativa', value: 'Declaração formal aceita' },
              { label: 'Responsável', value: activeOpportunity.recommendedCompany || 'Veeluen Solutions' }
            ],
            pendencias: [
              'Emitir declaração formal de pleno conhecimento das condições operacionais',
              'Assinatura digital pelo responsável técnico antes do fechamento do lote'
            ],
            recomendacao: 'Substituir vistoria presencial pela declaração padrão do Vellia.',
            fontes: 'Baseado em 3 registros do Vellia (Edital cláusula 7.2, Anexo III e Modelo de Declaração).'
          };
        } else if (lower.includes('qualificação') || lower.includes('atestado') || lower.includes('capacidade')) {
          structuredReply = {
            resumo: `Exigência de Qualificação Técnica: Comprovação de execução de no mínimo 50% dos quantitativos principais em serviços correlatos offshore.`,
            indicadores: [
              { label: 'Atestado CAT', value: 'Disponível (4892/2023)' },
              { label: 'Equipe Especializada', value: '100% Qualificada' },
              { label: 'Enquadramento', value: 'Apto' }
            ],
            pendencias: [
              'Anexar ART de desfecho do serviço executado em 2023',
              'Validar certidão de acervo técnico no CREA/RJ'
            ],
            recomendacao: 'Documentação técnica compatível com as exigências editalícias.',
            fontes: 'Baseado em 4 registros do Vellia (Acervo CREA, CAT 4892/2023, Dossiê Técnico e Edital).'
          };
        } else if (lower.includes('go') || lower.includes('decisão') || lower.includes('recomendação')) {
          const dec = DecisionService.calculateDecision(activeOpportunity);
          structuredReply = {
            resumo: `Avaliação Estratégica GO / NO-GO para #${activeOpportunity.id}: O processo apresenta elevada aderência e retorno financeiro projetado condizente com a meta.`,
            indicadores: [
              { label: 'Decisão', value: dec?.recommendationTier || 'GO COM PENDÊNCIAS' },
              { label: 'Aderência', value: `${activeOpportunity.score || 92}%` },
              { label: 'Margem Alvo', value: '24%' }
            ],
            pendencias: [
              'Aprovar planilha de custos com a controladoria',
              'Confirmar disponibilidade do responsável técnico designado'
            ],
            recomendacao: `${dec?.recommendationTier || 'GO COM PENDÊNCIAS'} — Prosseguir para fechamento de proposta comercial.`,
            fontes: 'Baseado em 5 registros do Vellia (Matriz Decisória, Score Ponderado, Simulação de Margem e Histórico).'
          };
        } else {
          structuredReply = {
            resumo: `Processando análise da oportunidade #${activeOpportunity.id} com base no banco de inteligência do Vellia Licitações.`,
            indicadores: [
              { label: 'Status Cadastral', value: 'Regular' },
              { label: 'Portal', value: activeOpportunity.portal || 'Petronect' },
              { label: 'Risco Jurídico', value: 'Baixo' }
            ],
            pendencias: [
              'Conferir minuta final no portal antes da data-limite'
            ],
            recomendacao: 'Manter proposta na esteira de elaboração prioritária.',
            fontes: 'Baseado em 3 registros do Vellia (Registro Petronect, Histórico Corporativo e Matriz de Riscos).'
          };
        }
      } else {
        if (lower.includes('prazo') || lower.includes('vencem') || lower.includes('dias')) {
          structuredReply = {
            resumo: `Prazos Críticos na Operação: 3 oportunidades com submissão prevista nos próximos dias exigem conferência de dossiers.`,
            indicadores: [
              { label: 'Hoje / 24h', value: '1 edital' },
              { label: '3 a 5 dias', value: '2 editais' },
              { label: 'Valor Total', value: 'R$ 4.93M' }
            ],
            pendencias: [
              'Concluir precificação de Petrobras Bacia de Santos (vence em 3 dias)',
              'Emitir termo de garantia para Monitoramento Búzios'
            ],
            recomendacao: 'Concentrar esforço da equipe nas oportunidades de ciclo curto.',
            fontes: 'Baseado em 6 registros do Vellia (Radar Diário, Esteira de Propostas e Cronograma Integrado).'
          };
        } else if (lower.includes('certid') || lower.includes('document')) {
          structuredReply = {
            resumo: `Centro de Capacidade & Certidões: A maior parte do acervo documental está em dia, com 1 alerta preventivo de renovação.`,
            indicadores: [
              { label: 'Certidões Válidas', value: '18 de 19' },
              { label: 'Em Renovação', value: '1 (CND Federal)' },
              { label: 'Bloqueadores', value: 'Nenhum impeditivo' }
            ],
            pendencias: [
              'Acompanhar emissão da CND Federal da Veeluen Solutions (vence em 5 dias)'
            ],
            recomendacao: 'Renovação automatizada em andamento sem risco de desclassificação.',
            fontes: 'Baseado em 4 registros do Vellia (Vault Documental, Robô de Certidões e Logs de Validade).'
          };
        } else {
          structuredReply = {
            resumo: `Consulta processada pelo motor de inteligência do Vellia. Rastreando editais, aderências e pipeline corporativo em tempo real.`,
            indicadores: [
              { label: 'Editais Mapeados', value: '14' },
              { label: 'Aderência Média', value: '88%' },
              { label: 'Taxa de Sucesso Histórica', value: '41%' }
            ],
            pendencias: [
              'Manter monitoramento de esclarecimentos no portal Petronect'
            ],
            recomendacao: 'Acessar o módulo Oportunidades para triagem individualizada.',
            fontes: 'Baseado em 4 registros do Vellia.'
          };
        }
      }

      setMessages(prev => [...prev, { 
        sender: 'bot', 
        structured: structuredReply 
      }]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 10, 20, 0.82)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '780px',
        backgroundColor: 'var(--surface-card, #0F172A)',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-elevation, 0 24px 48px rgba(0, 0, 0, 0.5))',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '88vh',
        overflow: 'hidden'
      }}>
        {/* Header do Copilot (Quiet Intelligence) */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--surface-app, #0A0F1D)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(2, 132, 199, 0.15)',
              border: '1px solid rgba(2, 132, 199, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38BDF8'
            }}>
              <Bot size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#F8FAFC', fontWeight: 700 }}>
                  Perguntar ao Vellia
                </h3>
                <span style={{
                  fontSize: '11px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#94A3B8',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 600
                }}>
                  Quiet Intelligence
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                {activeOpportunity 
                  ? `Contexto: ${activeOpportunity.client || 'Petrobras'} • Edital #${activeOpportunity.id}` 
                  : `Contexto Operacional: Módulo ${currentModule}`}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Zona Central Ampla de Mensagens */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          minHeight: '320px',
          maxHeight: '520px',
          background: 'var(--surface-app, #0A0F1D)'
        }}>
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: m.sender === 'user' ? '80%' : '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                width: m.sender === 'bot' ? '100%' : 'auto'
              }}
            >
              {m.sender === 'user' ? (
                <div style={{
                  background: 'var(--color-brand-primary, #0284C7)',
                  color: '#FFFFFF',
                  padding: '12px 18px',
                  borderRadius: '14px 14px 2px 14px',
                  fontSize: '13.5px',
                  lineHeight: 1.5,
                  fontWeight: 500
                }}>
                  {m.text}
                </div>
              ) : (
                /* RESPOSTA ESTRUTURADA (FASE 25: ITENS 62-64) */
                <div style={{
                  background: 'var(--surface-card, #0F172A)',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: 'var(--shadow-subtle, 0 4px 12px rgba(0, 0, 0, 0.2))'
                }}>
                  {/* Resumo */}
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Resumo Executivo
                    </span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: '#E2E8F0', lineHeight: 1.55 }}>
                      {m.structured?.resumo || m.text}
                    </p>
                  </div>

                  {/* Indicadores Tabulares */}
                  {m.structured?.indicadores && (
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Indicadores Chave
                      </span>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: '10px',
                        marginTop: '6px'
                      }}>
                        {m.structured.indicadores.map((ind, iIdx) => (
                          <div key={iIdx} style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '8px',
                            padding: '8px 12px'
                          }}>
                            <div style={{ fontSize: '11px', color: '#94A3B8' }}>{ind.label}</div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', fontVariantNumeric: 'tabular-nums' }}>
                              {ind.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pendências */}
                  {m.structured?.pendencias && m.structured.pendencias.length > 0 && (
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Pendências Identificadas
                      </span>
                      <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', fontSize: '13px', color: '#CBD5E1', lineHeight: 1.5 }}>
                        {m.structured.pendencias.map((pend, pIdx) => (
                          <li key={pIdx} style={{ marginBottom: '4px' }}>{pend}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recomendação */}
                  {m.structured?.recomendacao && (
                    <div style={{
                      padding: '10px 14px',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Recomendação Vellia
                      </span>
                      <strong style={{ fontSize: '13px', color: '#F8FAFC', fontWeight: 600 }}>
                        {m.structured.recomendacao}
                      </strong>
                    </div>
                  )}

                  {/* Ação Direta Contextual (Fase 26: Itens 110 e 111) */}
                  {activeOpportunity && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                      <button
                        onClick={() => {
                          if (onSelectOpportunity) onSelectOpportunity(activeOpportunity);
                          onClose();
                        }}
                        style={{
                          background: 'rgba(2, 132, 199, 0.12)',
                          border: '1px solid rgba(2, 132, 199, 0.3)',
                          color: '#38BDF8',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>Abrir Oportunidade #{activeOpportunity.id}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  )}

                  {/* Fontes Discretas (Item 64) */}
                  {m.structured?.fontes && (
                    <div style={{
                      paddingTop: '8px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      fontSize: '11px',
                      color: '#64748B',
                      fontStyle: 'italic'
                    }}>
                      {m.structured.fontes}
                    </div>
                  )}
                </div>
              )}

              {/* Prompts Sugeridos */}
              {m.suggestions && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                  {m.suggestions.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSend(sug)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.09)',
                        color: '#94A3B8',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(2, 132, 199, 0.12)';
                        e.currentTarget.style.color = '#38BDF8';
                        e.currentTarget.style.borderColor = 'rgba(2, 132, 199, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                        e.currentTarget.style.color = '#94A3B8';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
                      }}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div style={{
              alignSelf: 'flex-start',
              background: 'var(--surface-card, #0F172A)',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#94A3B8',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Sparkles size={14} color="#38BDF8" />
              <span>Analisando base do Vellia...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Rodapé com Input e Ação Direta */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          background: 'var(--surface-card, #0F172A)',
          display: 'flex',
          gap: '12px'
        }}>
          <input
            type="text"
            placeholder="Perguntar sobre cláusulas, certidões, prazos ou concorrentes..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            style={{
              flex: 1,
              backgroundColor: 'var(--surface-input, #1E293B)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#F8FAFC',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13.5px',
              outline: 'none'
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim()}
            style={{
              backgroundColor: inputValue.trim() ? 'var(--color-brand-primary, #0284C7)' : 'rgba(255, 255, 255, 0.08)',
              color: inputValue.trim() ? '#FFFFFF' : '#64748B',
              border: 'none',
              borderRadius: '8px',
              padding: '0 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: inputValue.trim() ? 'pointer' : 'default',
              fontWeight: 600,
              fontSize: '13px'
            }}
          >
            <span>Consultar</span>
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
