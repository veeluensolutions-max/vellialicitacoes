# VELLIA LICITAÇÕES — FASE 60
## RELATÓRIO EXECUTIVO & TÉCNICO: EXECUTIVE COCKPIT + STRATEGIC COMMAND CENTER 3.0 + VISÃO ÚNICA PARA DIRETORIA

---

### 1. PRINCÍPIO E FUNDAMENTOS
A Fase 60 entrega o **Vellia Executive Cockpit 3.0**, a interface de comando estratégico definitiva desenhada para presidentes, diretores e tomadores de decisão do grupo.
O princípio fundamental é:
> **MANAGEMENT BY EXCEPTION (GESTÃO POR EXCEÇÃO)**
> A diretoria não precisa de mais dados ou dashboards genéricos. Precisa enxergar rapidamente **desvios, riscos, oportunidades relevantes, decisões pendentes e mudanças materiais**.

O Executive Cockpit responde de forma imediata a 6 perguntas centrais:
1. **Onde estamos?** (Pipeline qualificado, commit, contratos vigentes e cobertura de meta)
2. **O que mudou?** (Novas licitações materiais, avanços de estágio, vitórias e perdas)
3. **O que está em risco?** (Concentração excessiva, gargalos de CND e reajustes de fornecedores)
4. **O que precisa ser decidido?** (Alçadas de margem, GO/NO-GO e termos aditivos)
5. **O que o Vellia recomenda avaliar?** (Recomendações estratégicas explicáveis com índice de confiança)
6. **Qual é o próximo movimento?** (Prioridades da semana, janelas de renovação e WBR)

---

### 2. ESTRUTURA DOS 4 BLOCOS PRINCIPAIS

#### 1. Agora & Indicadores Canônicos (Primeira Dobra)
- **Pipeline Bruto**: R$ 18.4M (volume total de certames monitorados).
- **Pipeline Qualificado**: R$ 14.2M (aderência técnica $\ge$ 75%).
- **Pipeline Ponderado**: R$ 8.6M (valor real ponderado pela probabilidade de sucesso).
- **Commit**: R$ 5.2M (propostas já enviadas e em fase de julgamento).
- **Valor em Risco**: R$ 2.4M (oportunidades com recursos ou pendências documentais).
- **Cobertura de Meta**: 86% do objetivo trimestral estabelecido.

#### 2. Valor em Movimento & Concentração
- **Valor em Movimento (Últimos 7 dias)**:
  - Novas Identificadas: `+R$ 1.85M`
  - Avanço de Estágio: `R$ 4.20M`
  - Vitórias Homologadas (Won): `R$ 980k`
  - Perdidas (Lost): `R$ 450k`
- **Índice de Concentração**:
  - As 3 maiores oportunidades representam **52%** de todo o pipeline ponderado.
  - Comprador Principal (Petrobras): **38%** de concentração.

#### 3. Decisões que Precisam de Você & Top Riscos
- **Decisões Priorizadas por Impacto + Urgência**:
  1. *Aprovação de Margem (16.8%)* — Pregão Sabesp EEE Guarulhos (R$ 4.25M) • Prazo: Amanhã às 09:00.
  2. *Decisão GO/NO-GO* — Contrato REDUC Manutenção (R$ 3.80M) • Exige subcontratação de instrumentação.
  3. *Termo Aditivo* — Contrato Sabesp Elevatória Norte (supressão amigável de 4.8%).
- **Top Riscos Estratégicos**:
  - Concentração de Comprador (Mitigação: aceleração na Sabesp e Sanepar).
  - Certidão Municipal de Filial Campinas em fase de revalidação.
  - Pressão de custo em tubulações e válvulas especiais.

#### 4. Contratos, Renovações & Próximos Movimentos
- **Contratos Vigentes**: 18 contratos ativos gerando R$ 28.4M de previsibilidade.
- **Janelas de Renovação**:
  - Até 90 dias: 2 contratos (Alerta: antecipar diálogo com fiscal).
  - 91 a 180 dias: 4 contratos.
  - Acima de 180 dias: 12 contratos.
- **Recomendações Estratégicas (Fase 57)**: Priorização do certame Sabesp Guarulhos e renegociação antecipada de contrato de efluentes.
- **Integração com WBR (Fase 54) e Laboratório de Cenários (Fase 56)**.

---

### 3. RECURSOS EXECUTIVOS EXCLUSIVOS

#### Board Mode (Apresentação Diretoria em Tela Cheia)
- Modo de projeção limpo em fullscreen, formatado como apresentação executiva em slides:
  1. *Visão Geral Estratégica*
  2. *Pipeline & Concentração de Mercado*
  3. *Decisões Críticas de Alçada*
  4. *Mapa de Riscos & Mitigações*

#### Executive Brief (Gerador de Resumo para Conselho)
- Gera documento conciso de 1 a 2 páginas com síntese de pipeline, decisões prioritárias e riscos imediatos, pronto para impressão em PDF ou envio formal.

#### Copilot Executivo Integrado
- Respostas rápidas e sem jargões técnicos para perguntas executivas:
  - *"O que precisa da minha decisão hoje?"*
  - *"Resuma o que mudou esta semana."*
  - *"Quais são os maiores riscos estratégicos?"*

#### Governança Multiempresa & Privacidade Financeira
- Suporte a filtros por empresa: **Veeluen Soluções**, **Excelência Ambiental** ou **Visão Consolidada do Grupo** (sem somar duplicações).
- Proteção de dados financeiros: exibição de margem líquida e pisos condicionada a credenciais autorizadas.

---

### 4. ARTEFATOS ENTREGUES
- **Service Core**: [src/services/cockpit/executiveCockpitService.js](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/services/cockpit/executiveCockpitService.js)
- **Componente Principal**: [src/components/cockpit/ExecutiveCockpitView.jsx](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/components/cockpit/ExecutiveCockpitView.jsx)
- **Estilos Visuais**: [src/components/cockpit/ExecutiveCockpitView.css](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/components/cockpit/ExecutiveCockpitView.css)
- **Navegação & Rota**: Integrado no [Sidebar.jsx](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/components/Sidebar.jsx) e no [App.jsx](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/App.jsx).
