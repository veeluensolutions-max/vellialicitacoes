# VELLIA LICITAÇÕES — RELATÓRIO EXECUTIVO OFICIAL
## FASE 55 — STRATEGIC MEMORY + DECISION INTELLIGENCE + MEMÓRIA INSTITUCIONAL

---

### SUMÁRIO EXECUTIVO
A **Fase 55** implementa o conceito e a infraestrutura de **Memória Estratégica (Strategic Memory)** e **Inteligência Decisória (Decision Intelligence)** do **Vellia Licitações**.

O princípio fundamental estabelecido nesta fase é:
> **O Vellia já registrava eventos. Porém, evento não é decisão. A Fase 55 transforma EVENTO em DECISÃO + CONTEXTO + PREMISSA + RESULTADO.**

Desta forma, a organização deixa de depender da memória volátil de indivíduos para responder a questões críticas de gestão e auditoria:
- *Por que participamos daquela licitação?*
- *Por que desistimos do certame X?*
- *Por que aprovamos aquele preço e aquela margem?*
- *Qual premissa foi assumida naquele momento e ela se confirmou?*
- *Já tomamos decisões semelhantes no passado?*
- *O que aprendemos com o desfecho real daquele contrato?*

---

### 1. AS QUATRO PERSPECTIVAS DA MEMÓRIA ESTRATÉGICA

```mermaid
flowchart LR
    A["1. DECISÃO<br/>(O que foi deliberado e por quem)"] --> B["2. CONTEXTO<br/>(Snapshot imutável no momento)"]
    B --> C["3. PREMISSAS<br/>(O que acreditávamos)"]
    C --> D["4. RESULTADO<br/>(O que aconteceu depois)"]
    D --> E["APRENDIZADO & PRECEDENTE<br/>(Alimenta a próxima decisão)"]
```

1. **Decisão (Decision):**
   - Registrada com tipagem controlada (`GO`, `NO-GO`, `CONDITIONAL-GO`, `MARGIN_APPROVAL`, `RISK_ACCEPTANCE`, `STRATEGIC_PRIORITY`, etc.), responsável explícito, data/hora e alçadas de governança.
   - Justificativa obrigatória vinculada a Reason Codes primários padronizados; proibição de justificativa genérica ou vazia em decisões materiais.
2. **Contexto (DecisionContext Snapshot):**
   - Congela o estado exato do sistema no momento da deliberação: valor estimado, proposta, margem calculada, matriz de risco, aderência técnica (fit score), prontidão de capacidade e concorrentes mapeados.
   - **Regra de Ouro:** Decisões históricas nunca são recalculadas com dados presentes; a verdade do momento é preservada de forma imutável.
3. **Premissas (DecisionAssumption):**
   - Hipóteses fundamentadas com fontes declaradas (cotação de fornecedor, cronograma técnico, parecer jurídico, análise de mercado).
   - Ciclo de vida próprio: `OPEN`, `CONFIRMED`, `PARTIALLY_CONFIRMED`, `INVALIDATED`, `UNKNOWN`.
   - A invalidação posterior de uma premissa alimenta lições aprendidas sem adulterar a decisão original.
4. **Resultados (DecisionOutcome):**
   - Vinculação posterior do desfecho verificado no certame ou na execução contratual (`POSITIVE`, `NEUTRAL`, `NEGATIVE`, `MIXED`, `NOT_YET_KNOWN`).
   - **Princípio Central: Decision ≠ Resultado.** Uma decisão excelente pode sofrer com um evento imprevisível externo; uma decisão fraca pode ter um resultado favorável por sorte. A avaliação foca na completude do contexto e na acurácia das premissas.

---

### 2. PRECEDENTES INTERNOS E DETECÇÃO DE DIVERGÊNCIA
- **SimilarDecisionService:**
  - Motor de busca multidimensional que combina critérios estruturados (objeto/serviço, órgão comprador, faixa de valor, severidade de risco, UF/região e sobreposição de motivos) com similaridade semântica.
  - Termo canônico adotado: **Casos comparáveis / Precedentes Internos** (orienta a reflexão, sem forçar decisões automáticas).
- **Detecção de Divergência Decisória (Decision Divergence):**
  - Alerta executivo quando a decisão pretendida contraria o padrão histórico consolidado (exemplo: GO com margem de 8% em contexto onde o padrão em 5 casos comparáveis foi NO-GO para margens inferiores a 10%).
  - Não bloqueia autoritariamente a decisão, mas recomenda o registro de justificativa executiva formal para a exceção.

---

### 3. DÍVIDA DECISÓRIA (DECISION DEBT) E VERSIONAMENTO SUPERSEDED
- **Versionamento Histórico (Superseded Decisions):**
  - Quando uma decisão for revista ou revogada (exemplo: GO substituído por NO-GO após um Adendo do edital elevar exigências de atestados), a decisão anterior **nunca é apagada**.
  - Seu status é alterado para `SUPERSEDED`, preservando o histórico integral e registrando explicitamente a resposta para a pergunta: *"Por que mudamos de ideia?"*.
- **Indicador de Decision Debt:**
  - Identifica decisões materiais que carecem de justificativa formal documentada, sem dono atribuído, sem premissas registradas ou com revisões periódicas vencidas.
  - Usado como ferramenta de higiene de governança corporativa, nunca como ranking punitivo de colaboradores.

---

### 4. COPILOT DE MEMÓRIA ESTRATÉGICA
O Copilot Executivo responde consultas em linguagem natural com estrutura canônica fixa:
- **Estrutura:** `Decisão` + `Motivo` + `Evidência` + `Resultado`.
- **Honestidade de Governança:** Se uma decisão histórica foi tomada sem o registro formal de motivo, o Copilot expressa com transparência: *"Não há justificativa registrada"*, em vez de inventar ou presumir raciocínios inexistentes.
- **Sigilo por Alçada:** Usuários sem permissão financeira têm detalhes confidenciais de margem e preço preservados sob sigilo.

---

### 5. VALIDAÇÃO DOS 14 TESTES DE ESPECIFICAÇÃO

| Teste | Cenário Avaliado | Resultado do Sistema |
|---|---|---|
| **Teste 1** | GO com rationale e snapshot. | Snapshot congelado com valores, margem e fit técnico; status ativo. |
| **Teste 2** | Dados de mercado/edital mudam depois. | Decisão histórica permanece estritamente idêntica. |
| **Teste 3** | Premissa invalidada posteriormente. | Status da premissa vira `INVALIDATED` e alimenta lessons learned sem alterar a decisão. |
| **Teste 4** | GO substituído por NO-GO. | Ambas as decisões são preservadas; a original ganha status `SUPERSEDED`. |
| **Teste 5** | Busca: "Por que desistimos da licitação X?". | Retorna a decisão NO-GO correspondente com motivo e evidência documental. |
| **Teste 6** | Busca de casos semelhantes. | SimilarDecisionService isola serviços comparáveis sem misturar escopos alheios. |
| **Teste 7** | Decisão sem motivo registrado. | Sistema informa expressamente a ausência de justificativa cadastrada. |
| **Teste 8** | Usuário sem permissão financeira. | Dados confidenciais de margem permanecem ocultos por controle de alçada. |
| **Teste 9** | Visão multiempresa (Group View). | Separação estrita entre Veeluen, Excelência e Grupo sem contaminação indevida. |
| **Teste 10** | Deliberação na WBR (Fase 54). | Alimentação direta da Memória Estratégica sem duplicação de entidades. |
| **Teste 11** | Decisão condicional (Conditional GO). | Condição com prazo vencido dispara alerta na Dívida Decisória. |
| **Teste 12** | Decisão estratégica com review agendada. | Notificação na data de revisão para reavaliação de premissas. |
| **Teste 13** | Decisão com versão anterior de modelo. | Histórico íntegro preservado com referência ao snapshot da época. |
| **Teste 14** | Acesso em dispositivo móvel. | Interface responsiva destacando decisões, premissas e precedentes essenciais. |

---

### 6. ARQUIVOS IMPLEMENTADOS E CONECTADOS
1. [similarDecisionService.js](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/services/decision/similarDecisionService.js)
2. [strategicMemoryService.js](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/services/decision/strategicMemoryService.js)
3. [StrategicMemoryView.jsx](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/components/decisionMemory/StrategicMemoryView.jsx)
4. [StrategicMemoryView.css](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/components/decisionMemory/StrategicMemoryView.css)
5. [Sidebar.jsx](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/components/Sidebar.jsx)
6. [App.jsx](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/App.jsx)

---

### 7. CONCLUSÃO
A **Fase 55** consolida o Vellia Licitações como uma plataforma verdadeiramente inteligente: o conhecimento e os critérios de decisão não ficam mais restritos à memória isolada de pessoas, mas tornam-se **memória institucional auditável, acumulável e estratégica** para a Veeluen e para a Excelência.
