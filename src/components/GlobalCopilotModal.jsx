import React, { useState, useEffect } from 'react';
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
  Clock
} from 'lucide-react';
import { OpportunityService } from '../services/opportunityService';
import { DecisionService } from '../services/decision/decisionService';

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

  // Inicializa com contexto do sistema ou da oportunidade ativa
  useEffect(() => {
    if (isOpen) {
      if (activeOpportunity) {
        setMessages([
          {
            sender: 'bot',
            text: `Olá! Estou contextualizado na oportunidade **${activeOpportunity.id} — ${activeOpportunity.title}** (${activeOpportunity.client}). Como posso acelerar sua análise de habilitação ou edital?`,
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
            text: `Olá! Sou o **Vellia Copilot** para o módulo **${currentModule.toUpperCase()}**. Como posso ajudar no monitoramento, precificação ou habilitação hoje?`,
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

    setTimeout(() => {
      let botReply = '';
      const lower = query.toLowerCase();

      if (activeOpportunity) {
        if (lower.includes('visita') || lower.includes('técnica')) {
          botReply = `🔎 **Análise de Visita Técnica (${activeOpportunity.id}):**\nConforme item 7.2 do edital ${activeOpportunity.portal}, a visita técnica é **FACULTATIVA**, podendo ser substituída por declaração formal de pleno conhecimento das condições do local assinada pelo responsável técnico da **${activeOpportunity.recommendedCompany || 'Veeluen Solutions'}**.`;
        } else if (lower.includes('qualificação') || lower.includes('atestado') || lower.includes('capacidade')) {
          botReply = `📑 **Qualificação Técnica Exigida:**\nExige comprovação de execução de no mínimo 50% do quantitativo principal em serviço similar (Licenciamento ou Monitoramento Ambiental Offshore). O acervo técnico da **${activeOpportunity.recommendedCompany || 'Excelência Ambiental'}** atende plenamente (CAT 4892/2023 registrada no CREA).`;
        } else if (lower.includes('go') || lower.includes('decisão') || lower.includes('recomendação')) {
          const dec = DecisionService.calculateDecision(activeOpportunity);
          botReply = `⚖️ **Recomendação Vellia:** **${dec ? dec.recommendationTier : 'GO COM PENDÊNCIAS'}**.\nAderência de ${activeOpportunity.score || 92}%, margem provável de 24%, risco operacional moderado. O prazo de submissão é de ${activeOpportunity.daysLeft || 3} dias.`;
        } else {
          botReply = `Com base nas cláusulas do edital **${activeOpportunity.id}** e nas diretrizes da **${activeOpportunity.recommendedCompany || 'sua empresa'}**, este processo encontra-se em conformidade de habilitação jurídica e fiscal, sem impedimentos cadastrais no Petronect.`;
        }
      } else {
        if (lower.includes('prazo') || lower.includes('vencem') || lower.includes('dias')) {
          botReply = `⏰ **Prazos Críticos na Operação:**\nIdentifiquei 3 licitações críticas:\n1. **Petrobras Bacia de Santos** (Vence em 3 dias) — R$ 2.400.000\n2. **Monitoramento Búzios** (Vence em 5 dias) — R$ 1.850.000\n3. **Auditoria Ambiental Macaé** (Vence em 7 dias) — R$ 680.000.`;
        } else if (lower.includes('certid') || lower.includes('document')) {
          botReply = `🛡️ **Centro de Capacidade & Certidões:**\n- CND Federal Veeluen Solutions: Vence em **5 dias** (renovação automática pronta).\n- Demais certidões trabalhistas (CNDT) e FGTS: **Válidas e ativas**.`;
        } else {
          botReply = `Processando solicitação com base nos dados do **Vellia Licitações 1.0**. Os robôs de monitoramento rastrearam 14 oportunidades ativas no Petronect hoje, com 6 de alta relevância comercial.`;
        }
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 11, 24, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '680px',
        backgroundColor: '#0F172A',
        border: '1px solid rgba(0, 229, 201, 0.3)',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 25px rgba(0, 229, 201, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '85vh',
        overflow: 'hidden'
      }}>
        {/* Header do Copilot */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.95), rgba(30, 58, 138, 0.25))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00E5C9, #1E3A8A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0B132B'
            }}>
              <Bot size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#FFF', fontWeight: 700 }}>Vellia Copilot</h3>
                <span style={{
                  fontSize: '10px',
                  background: 'rgba(0, 229, 201, 0.15)',
                  color: '#00E5C9',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 700
                }}>
                  GLOBAL CONTEXT
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>
                {activeOpportunity 
                  ? `Contexto: ${activeOpportunity.title.substring(0, 36)}...` 
                  : `Contexto Geral: Módulo ${currentModule}`}
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
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Mensagens */}
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          minHeight: '280px',
          maxHeight: '420px'
        }}>
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{
                background: m.sender === 'user' ? '#1E3A8A' : 'rgba(30, 41, 59, 0.8)',
                color: '#F8FAFC',
                padding: '12px 16px',
                borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                border: m.sender === 'user' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(148, 163, 184, 0.15)',
                fontSize: '13px',
                lineHeight: 1.5,
                whiteSpace: 'pre-line'
              }}>
                {m.text}
              </div>

              {m.suggestions && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>Perguntas rápidas:</span>
                  {m.suggestions.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSend(sug)}
                      style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(0, 229, 201, 0.25)',
                        color: '#00E5C9',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      💡 {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div style={{
              alignSelf: 'flex-start',
              background: 'rgba(30, 41, 59, 0.5)',
              padding: '8px 14px',
              borderRadius: '12px',
              color: '#00E5C9',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sparkles size={14} className="spinning" />
              <span>Vellia Copilot analisando documentos...</span>
            </div>
          )}
        </div>

        {/* Rodapé com Input */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid rgba(148, 163, 184, 0.12)',
          background: 'rgba(15, 23, 42, 0.95)',
          display: 'flex',
          gap: '10px'
        }}>
          <input
            type="text"
            placeholder="Faça uma pergunta sobre editais, prazos ou regras..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            style={{
              flex: 1,
              backgroundColor: '#1E293B',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              color: '#FFF',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim()}
            style={{
              backgroundColor: inputValue.trim() ? '#00E5C9' : 'rgba(148, 163, 184, 0.2)',
              color: inputValue.trim() ? '#0B132B' : '#94A3B8',
              border: 'none',
              borderRadius: '8px',
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputValue.trim() ? 'pointer' : 'default',
              fontWeight: 700
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
