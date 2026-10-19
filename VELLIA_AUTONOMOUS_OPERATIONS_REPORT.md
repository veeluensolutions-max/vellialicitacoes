# VELLIA LICITAÇÕES — FASE 58
## RELATÓRIO EXECUTIVO & TÉCNICO: AUTONOMOUS OPERATIONS GUARDRAILS + POLICY ENGINE + GOVERNANÇA DE AUTOMAÇÃO

---

### 1. PRINCÍPIO E FUNDAMENTOS
A Fase 58 estabelece uma fronteira de segurança estrutural: **Automação Proporcional ao Risco**.
Quanto maior o impacto no mundo real, menor deve ser a autonomia sem supervisão humana direta.

- **Diferenciação Crítica**:
  - **RBAC**: Responde *"Este usuário pode fazer?"*
  - **Guardrail / Policy Engine**: Responde *"O sistema pode fazer sozinho?"*
- **Hierarquia Inviolável de Precedência**:
  1. `Hard Safety Rules` (Sempre vencem; intransponíveis por configuração ou UI)
  2. `Security Permissions` (RBAC)
  3. `Company Policy` (Veeluen vs Excelência)
  4. `Action Policy`
  5. `Workflow Context`
  6. `User Confirmation`

---

### 2. NÍVEIS DE AUTONOMIA CONSOLIDADOS (0 A 5)
> [!IMPORTANT]
> **NUNCA existe Level 6 ("Autonomia Total")**. Nenhuma IA, workflow ou rotina autônoma opera sem fronteiras.

| Nível | Classificação | Comportamento do Sistema | Exemplos de Ações |
| :--- | :--- | :--- | :--- |
| **Level 0** | **Manual Only** | Sistema apenas informa/alerta. Ação é exclusivamente manual. | Lance em certames (`bid.place`), Assinatura jurídica (`contract.sign`), CAPTCHA bypass. |
| **Level 1** | **Assist** | Analisa, sugere, contextualiza e explica; não executa nada. | Classificação de edital, recomendação de preço, scoring de aderência. |
| **Level 2** | **Prepare** | Prepara draft, minuta, formulário ou e-mail; operador confirma. | Elaboração de minuta de proposta, formulário de cadastro de fornecedor. |
| **Level 3** | **Internal Execution** | Executa ações internas seguras de forma 100% autônoma. | Criação de tarefas internas, atualização de índices, alertas de vencimento. |
| **Level 4** | **External Confirm** | Executa ação externa **somente** após confirmação humana contextual. | Envio de e-mail de esclarecimento, solicitação de cotação a parceiros. |
| **Level 5** | **External Approve** | Exige `ApprovalRequest` formal (Fase 36) + confirmação humana final. | Envio formal de proposta comercial, aceite de aditivo de contrato, compras em lote. |

---

### 3. HARD SAFETY BOUNDARIES (REGRAS INVIOLÁVEIS)
Configuradas diretamente no core da engine ([autonomyPolicyEngine.js](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/services/autonomy/autonomyPolicyEngine.js)):
- **`bid.place`**: Lances em pregão são estritamente manuais.
- **`contract.sign`**: Assinatura jurídica requer representação legal humana.
- **`contract.accept`**: Aceite de obrigações contratuais exige deliberação formal.
- **`captcha.bypass`**: Proibição estrita de qualquer técnica de contorno em portais.
- **`data.purge_critical`**: Exclusão definitiva de entidades críticas é estritamente manual.

---

### 4. GUARDRAILS OPERACIONAIS IMPLEMENTADOS
1. **Pre-Action Validation & Stale Approval**: Revalida se o destinatário ou o preço foram alterados desde o momento da preparação. Se houver divergência material, a aprovação anterior é invalidada automaticamente.
2. **Idempotência Rigorosa**: Toda `ActionIntent` externa possui `idempotencyKey` única para evitar disparos duplicados ou retries concorrentes.
3. **Sensitive Data Guardrail (DLP)**: Impede que termos confidenciais (margem líquida interna, floor price, notas jurídicas) sejam enviados para destinatários externos.
4. **Wrong-Company Protection**: Impede que usuários de uma empresa (ex: Veeluen) despachem documentos ou propostas pertencentes a outra (ex: Excelência Ambiental).
5. **Bulk Send Guardrail**: Disparos para mais de 10 destinatários são automaticamente elevados para Nível 5 (Aprovação Formal).
6. **Safe Stop & Kill Switch**: Permite congelar imediatamente qualquer despacho de automação com um clique, sem interromper leitura de dados.
7. **Simulador Dry Run**: Permite testar o comportamento do Policy Engine com qualquer payload sem gerar nenhum efeito colateral.

---

### 5. ARTEFATOS ENTREGUES
- **Engine Core**: [src/services/autonomy/autonomyPolicyEngine.js](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/services/autonomy/autonomyPolicyEngine.js)
- **Componente Visual**: [src/components/autonomy/AutonomyGovernanceCenterView.jsx](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/components/autonomy/AutonomyGovernanceCenterView.jsx)
- **Estilos CSS**: [src/components/autonomy/AutonomyGovernanceCenterView.css](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/components/autonomy/AutonomyGovernanceCenterView.css)
- **Navegação & Rota**: Integrado no [Sidebar.jsx](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/components/Sidebar.jsx) e no [App.jsx](file:///c:/Users/USU%C3%81RIO/OneDrive/%C3%81rea%20de%20Trabalho/OneDrive/Documentos/Vellia%20Licita%C3%A7%C3%B5es/src/App.jsx).
