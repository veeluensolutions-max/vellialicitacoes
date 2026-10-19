# VELLIA LICITAÇÕES — FASE 59
## RELATÓRIO EXECUTIVO & TÉCNICO: CONTROL TOWER + MISSION CONTROL + SUPERVISÃO OPERACIONAL CENTRALIZADA

---

### 1. PRINCÍPIO E FUNDAMENTOS
A Fase 59 entrega o **Vellia Mission Control (Central de Operações)**.
Diferente de um NOC técnico genérico ou monitor de infraestrutura, o Mission Control é estritamente **operacional**:
> **ESTADO $\rightarrow$ IMPACTO NO NEGÓCIO $\rightarrow$ AÇÃO NECESSÁRIA**

O operador ou executivo obtém em segundos respostas para as 5 perguntas fundamentais:
1. **O que está acontecendo agora?** (Agentes, workflows e ações ativas)
2. **O que precisa de uma pessoa?** (Confirmações de envio, aprovações de margem, revisões de dados)
3. **O que está com problema?** (Integrações com latência, jobs na DLQ, incidentes)
4. **O que isso afeta no mundo real?** (Oportunidades em risco, certames atrasados, capacidades preservadas)
5. **O que podemos fazer com segurança agora?** (Safe Retry idempotente, pausa de conector, liberação de ação)

---

### 2. ESTRUTURA DAS 5 ÁREAS OPERACIONAIS

#### 1. Agora (Now View)
- **Barra de Status Global**: Avaliação em tempo real (`NORMAL`, `ATTENTION`, `DEGRADED`, `CRITICAL`).
- **6 Cards Operacionais Chave**: Ações em Andamento, Precisa de Você, Workflows Ativos, Conectores Degradados, Incidentes Abertos, Falhas na Fila (DLQ).
- **Business Critical Watch**: Vigilância proativa sobre certames de alto valor (> R$ 1M) e prazos próximos (< 24h), como o Pregão Sabesp EEE Guarulhos (R$ 4.25M) e o Contrato Refinaria Duque de Caxias.
- **Operations Copilot**: Assistente contextual que responde dúvidas em linguagem natural ("O que precisa de atenção?", "Quais integrações estão degradadas?", "Existe algo bloqueando propostas hoje?").

#### 2. Precisa de Você (Human Queue)
- **Deadline-Aware Aging**: As pendências não são ordenadas por simples ordem cronológica (FIFO), mas pelo cruzamento entre **Criticidade da Ação** e **Proximidade do Deadline** do certame.
- **Contextual Action Card**: Exibe Solicitante, Órgão de Destino, Justificativa do Guardrail e Tempo decorrido.
- **One-Click Review**: Permite abrir e inspecionar o payload completo antes de despachar a liberação para o [autonomyPolicyEngine.js](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/services/autonomy/autonomyPolicyEngine.js).

#### 3. Automações & Filas (DLQ & Failed Jobs)
- **Workflows Operacionais**: Monitoramento contínuo de CNDs, Radar Petrobras e SLA Contratual com taxa de falhas e status nominal.
- **Dead Letter Queue (DLQ)**:
  - **Safe Retry**: Permitido com 1 clique apenas para jobs idempotentes (ex: sincronização de aditivo ou reenvio de cotação com chave de idempotência).
  - **Manual Review Required**: Bloqueia retry automático de ações sem idempotência comprovada.
  - **Dispensa Auditada (Dismiss)**: Requer justificativa operacional formal obrigatória registrada em log.

#### 4. Integrações & Cascading Impact
- **Saúde Real dos Conectores**: PNCP, Petronect, Compras.gov.br, Outlook/SMTP e Provedor de IA.
- **Impacto no Negócio Explícito**:
  - Exemplo PNCP: *"Latência de 35 min em novos editais. Todos os editais e certames já salvos permanecem 100% disponíveis para propostas e análise."*
  - Exemplo IA: *"Análise de novos documentos temporariamente pausada; CRM, contratos e busca exata funcionando 100%."*
- **Cascading Failure Detection**: Separa com precisão a causa primária das capacidades afetadas e não afetadas.
- **Reativação com Healthcheck Prévio**: O conector não volta imediatamente para nominal, mas para estado `RECOVERING`, processando o buffer de backlog antes de marcar como `HEALTHY`.

#### 5. Incidentes & Safety Events
- **Supressão de Alertas Duplicados**: Se um conector falhar 50 vezes, o Mission Control consolida em 1 único incidente operacional agregado.
- **Acknowledge Operacional**: Permite que a equipe assuma a responsabilidade de investigação (`acknowledgedBy`), mantendo o incidente aberto até a resolução efetiva.
- **Safety Events Timeline**: Registra proteções aplicadas (DLP confidencial bloqueado, tentativa cross-company interrompida, alteração material detectada).

---

### 3. GOVERNANÇA, MULTIEMPRESA & ROLES
- **Governança Estrita**: Nenhum comando operacional (Retry, Pause, Resume, Dismiss) contorna o Policy Engine da Fase 58.
- **Perfis de Visualização**:
  - `Executivo`: Resumo de impacto e decisões de alto nível.
  - `Operações`: Fila humana, workflows e saúde de conectores.
  - `Admin Técnico`: Jobs, filas de retries e auditoria detalhada.
- **Multiempresa Isolado**: Permite isolar a visão entre **Veeluen Soluções**, **Excelência Ambiental** ou **Visão Consolidada do Grupo**.

---

### 4. ARTEFATOS ENTREGUES
- **Service Core**: [src/services/missionControl/missionControlService.js](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/services/missionControl/missionControlService.js)
- **Componente Principal**: [src/components/missionControl/MissionControlView.jsx](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/components/missionControl/MissionControlView.jsx)
- **Estilos Visuais**: [src/components/missionControl/MissionControlView.css](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/components/missionControl/MissionControlView.css)
- **Navegação & Rota**: Integrado no [Sidebar.jsx](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/components/Sidebar.jsx) e no [App.jsx](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/App.jsx).
