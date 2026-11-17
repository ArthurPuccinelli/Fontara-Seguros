# DocuSign IAM — Playbook de Demos (base de conhecimento)

> Conhecimento **reutilizável** para montar demos DocuSign em qualquer cliente/projeto.
> Específicos de cada cliente ficam em `docs/demos/<cliente>.md`.
> Toda entrada tem data de verificação. Ao descobrir algo novo, adicione aqui.

Última atualização: 2026-11-16

---

## 0. Mapa de produtos IAM (nomes atuais, 2026)

| Produto | O que resolve | Como demonstrar | Observações |
|---|---|---|---|
| **Workflow Builder** (ex-Maestro) | Orquestração de jornadas: coleta → geração → assinatura → integrações → condicionais | UI de design + trigger por API (`/actions/trigger`) ou link/iframe `instance_url` | API ainda usa paths "maestro"/`aow_manage` |
| **Web Forms** | Formulários dinâmicos com lógica condicional; geram envelope | Embarcado via Docusign JS (`js-d.docusign.com/bundle.js`) ou URL; prefill via `formValues` | Sem fórmulas/scripts; token expira em 5 min |
| **Doc Gen** | Gera documento (.docx com `{{campos}}`) a partir de dados | Template eSignature com Doc Gen + passo no Workflow Builder | Condicionais limitadas → separar documentos por variante |
| **eSignature** | Assinatura (simples, AES, ICP-Brasil), roteamento, roles, testemunhas | Embedded signing / **Focused View** (`clientUserId`) | Sem `clientUserId` não existe embedded real |
| **Identify** | SMS/OTP, IDV com liveness, IdRC (Registro Civil) | Autenticação no recipient | Validar documentos BR suportados no IDV |
| **Navigator / Agreement Manager** | Repositório inteligente, extração por IA (Iris), busca/consulta | Upload de legados + extrações customizadas + filtros/perguntas | Extração em pt-BR disponível |
| **Docusign MCP Server** | Agentes (Claude etc.) consultam/agem na conta | Demo ao vivo no Claude: "quais contratos vencem em 90 dias?" | GA; usa permissões do usuário |
| **App Center / Extension apps** | Integrações (CRM, Data Verification, custom) | Passo de workflow chamando sistema | Requer app hospedado para custom |
| **Brands** | White label (logo, cores, idioma, textos) | Brand pt_BR aplicada ao envelope/workflow | |
| **WhatsApp / SMS delivery** | Entrega do envelope por canal móvel | `deliveryMethod` + `phoneNumber` no signer (ver §WhatsApp) | Habilitado na conta demo Fontara Financial (17/11/2026) |

---

## 1. Navegação na plataforma (passo a passo)

_Preenchido durante a criação das demos — ver seções abaixo._

### 1.1 Login e contas
- Console demo: `https://apps-d.docusign.com/send/home` (login em `account-d.docusign.com`). UI segue o idioma do usuário (pt-BR).
- Menu superior (2026-11): **Início | Acordos | Modelos | Automações | Insights | Admin**.
- Usuário com várias contas: confira a conta ativa no avatar (canto superior direito) antes de criar qualquer coisa — IDs de workflow/template são por conta.
- Pop-up "Automatize com o Workflow Builder!" aparece em várias telas: botão **Fechar** (canto inferior direito).
- Dica para automação via navegador: viewport pequeno esconde o painel lateral; páginas são SPA lentas (aguarde 3–4 s após navegar, telas ficam em "Carregando…").

### 1.2 Templates com Doc Gen
- **Modelos → Modelos de documentos** (`/send/document-templates`) é a biblioteca de documentos-base com Doc Gen. Botão **+ Criar novo**. Filtros: Tipo de Acordo, Status, Atualizado por. Alterações propagam para todos os envelopes-modelo que usam o documento.
- **Criar novo** → modal "Fazer upload de arquivo" (docx) + Nome + Tipo de Acordo (opcional — "A IA sugerirá um tipo"). ⚠️ O nome é sobrescrito pelo nome do arquivo ao fazer upload — redigite depois. Abre o editor em `/send/document-templates/editor/{id}/1`.
- **Editor novo (2026-11):** os placeholders `{{Campo}}` do .docx **NÃO viram campos automaticamente** — ficam como texto. Para criar campos de dados: no seletor de usuário escolha **Remetente** ("Preencher previamente os campos antes de enviar") → aparecem **Campos de acordo** do tipo de acordo (ex.: Proposta: CPF ou CNPJ, Data de Expiração, Foro…) + **+ → Campo** para campos próprios. O campo é inserido **na posição do cursor** do documento (clique no texto antes de clicar no campo; senão entra no início do documento).
- **"Posicionar campos com IA"** (ícone ✦ ao lado do +) **não funciona para documentos em português**: "O idioma neste documento ainda não é coberto pela IA" (2026-11-16).
- Campos de assinatura: selecione **Signatário N** e insira Assinatura / Data da assinatura na posição desejada. "Editar destinatários" cria papéis (ex.: Rep1..Rep3, Testemunha1/2).
- Há opção **⋮ → Mudar para editor clássico**.
- Dica: o Doc Gen "clássico" (template eSignature com .docx) reconhece `{{Campo}}` automaticamente — se tiver muitos campos, considere esse caminho ou a API (`isDocGenDocument` + `docGenFormFields`).
- No Workflow Builder, o passo **"Preparar modelo de documento"** (Doc Gen) tem 4 etapas: (1) Vincular um modelo (da biblioteca acima) → (2) Gerar automaticamente sem revisão? → (3) Combinar os campos do modelo com os campos do fluxo de trabalho → (4) Nome do documento.
- Outras áreas em Modelos: Modelos de envelopes (Meus Modelos, Compartilhado, Favoritos), **Cláusulas** (novo — biblioteca de cláusulas), Modelos do espaço de trabalho (Workspaces), **Modelos de fluxo de trabalho** (`/send/workflowtemplates`, galeria pronta), Formulários da Web. Aba "Modelos elásticos" (Elastic Templates / clickwrap-like).

### 1.3 Web Forms
- **Modelos → Formulários da Web → Meus formulários da Web** (`/send/forms`). Botão **Criar** → `/send/forms/new` → "How would you like to start?": **Use eSignature Template** (transforma template em formulário; campos do template viram campos do form) ou **Start from scratch** (form sem documento).
- Para gerar documento + assinatura a partir do form, comece pelo template eSignature.
- **Receita rápida (2026-11-16):** criar o template eSignature **por API** com PDF que tem os placeholders `{{Campo}}` em **branco/6pt** e tabs posicionadas por `anchorString` (`tabLabel` = nome do campo) — ver `scripts/create-resgate-template.mjs`. Ao criar o Web Form a partir dele ("Usar modelo do eSignature" → buscar → Avançar), os tabs viram campos ("10 campos do modelo foram importados") e o **Nome de referência da API = tabLabel** → o `formValues` do createInstance usa essas chaves. O Web Form cria uma **cópia** do template ("Criamos um novo modelo de envelope para o seu formulário").
- Campos do destinatário viram campos automáticos "Nome do {Papel}" / "E-mail do {Papel}" (API: `Nome_do_Titular`, `Email_do_Titular` — confira no painel).
- `listTabs` do template viram **lista suspensa** no form — ideal para regras condicionais.
- **Editor do form:** lista de páginas/campos à esquerda; painel direito com abas **Propriedades** (Nome do campo, Descrição, Campo obrigatório, **Somente leitura**, Controles do remetente: Ocultar/Exibir/Obrigatório, **Nome de referência da API**) e **Regras**.
- **Regras condicionais** ficam no campo **de origem** (ex.: selecione "Tipo de solicitação" → Regras → Criar regra → SE `é` "Portabilidade" → ENTÃO Mostrar → escolha o campo-alvo → Aplicar). Na prática, **um campo-alvo por regra** (crie várias regras com a mesma condição). Campos com regra ganham o selo "Regras aplicadas".
- ⚠️ Alguns campos importados vieram como **Somente leitura** — confira antes de ativar (útil para Nome/CPF pré-preenchidos pelo portal; ruim para campos que o cliente digita).
- ✅ **Validado (2026-11-16):** `createInstance` com `formValues` `{Nome_do_Titular, Email_do_Titular, NomeTitular, CpfTitular, NumeroCertificado}` → form embarcado via Docusign JS já abre pré-preenchido; campos "Somente leitura" aparecem travados (cinza). A tela de boas-vindas usa a **brand padrão de assinatura** da conta (logo + cor do botão) → white label sem configuração extra. Aviso "Este formulário é apenas para fins de demonstração" aparece em conta demo.
- **Ativar** → (1) **Conectar conta** (OAuth — o usuário precisa autorizar) → (2) remetente eSignature padrão → (3) ativar.
- Automação: o painel de propriedades rola e muda a posição dos inputs; ao automatizar, role o input para a vista antes de clicar (cliques "às cegas" ligaram "Somente leitura" por engano).

### 1.4 Workflow Builder
- Lista: **Acordos → Fluxos de trabalho** (`/send/workflows`), botão **Criar fluxo de trabalho**. Também acessível em **Automações → Fluxos de trabalho**. Automações também tem **Agentes** e **Regras** (novos, 2026-11).
- Editor: `/send/workflows/{workflowId}/edit` — o ID da URL é o mesmo usado na API (`/accounts/{acct}/workflows/{id}/actions/trigger`).
- Galeria de modelos prontos (`/send/workflowtemplates`) inclui "Abertura de conta bancária (Brasil)", "Conheça seu Cliente com ID Evidence", Salesforce/HubSpot/Box/Drive etc. — bom ponto de partida para demos de serviços financeiros.
- Padrão de referência (workflow "Onboarding de cliente portal"): **Iniciar (De uma chamada de API)** → **Coletar dados com Formulários da Web** → **Adicionar uma regra de várias ramificações** (ex.: Empresarial / Vida / Auto / Nenhuma condição) → por ramo: **Preparar modelo de documento** (Doc Gen) → **Enviar documentos para assinatura** → **Gravar dados no Salesforce**; ramo "nenhuma condição" → **Exibir uma tela de confirmação**.
- **Criar com IA (2026-11-16):** Criar fluxo de trabalho → **Projetar um fluxo de trabalho com IA** → descrever em pt-BR (citando os nomes exatos dos templates) → plano → **Aprovar e construir**. A IA encontra os templates pelo nome, cria os participantes a partir dos papéis e monta o esqueleto (Start API → Branching → Prepare eSignature Template → Send Documents for Signature → Confirmation). Os passos vêm em vermelho até você configurar.
- **Variáveis do Start (API):** Nova variável → Texto → nome. Em automação, `click()` via JS em "Nova variável" + item "Texto" e depois digitar.
- **Prepare eSignature Template → "Mapeie para mim" (IA):** mapeia sozinho os campos do template para as variáveis de nome parecido (11/14 no PF, 15/19 no PJ).
- **Send Documents:** documento = saída "Modelo do eSignature preparado"; por papel, associar o participante + nome/e-mail (escolha a **variável**, não "valor inserido manualmente"); notificação por **E-mail** e/ou **Mensagem de texto ou WhatsApp**; sessão **direta** (embarcada) ou **remota**.
- ✅ **Validado E2E (2026-11-16):** trigger via API → "Prepare eSignature Template" preenche os textTabs travados do template (anchors `{{Campo}}` em branco) com as variáveis → envelope chega ao signatário com todos os campos visíveis e corretos. Padrão recomendado quando o Doc Gen ainda não está pronto.
- **Publicar:** Revisar e publicar → "Verifique se há erros" → **Nomeie as instâncias** (criador de nomes com texto + até 3 variáveis) → Publicar → "Fluxo de trabalho publicado com sucesso! O URL estará disponível em cinco minutos". O `trigger_input_schema` passa a listar as variáveis + `startDate` (Date), `workflowBuilder`/`workflowPreparer` (User) adicionados automaticamente.
- ⚠️ **Sessão expira** (~1h) e alterações não salvas no editor se perdem → clique **Salvar rascunho** após cada passo.
- Mapeamento manual de campo no "Prepare eSignature Template": botão **+** ao lado do campo → Detalhes da instância | **Variáveis do início do fluxo de trabalho** | Informações do participante.
- Ramificação: SE `<variável>` `<operador>` (Igual a, Contém, Começa com, Está vazio…) `<valor>`; checkbox "Diferenciar maiúsculas e minúsculas"; ramo **"Nenhuma condição atendida"** (toggle) funciona como `else`. Etapa 2 "Juntar ramificações" opcional.
- ⚠️ **(2026-11-16) "Mapeie para mim" pode errar:** no template PJ a IA deslocou os representantes em uma posição (Rep1←titular, Rep2←rep1, Rep3←rep2), mapeou NumeroProposta←valorContribuicao e deixou testemunhas vazias. **Sempre revise campo a campo** depois do mapeamento por IA, e valide lendo os tabs do envelope (`listRecipients` com `include_tabs=true`).
- **Cada ramificação precisa de ≥1 etapa** para publicar ("Adicione pelo menos uma etapa à ramificação … antes de publicar"). Para não deixar o ramo "Nenhuma condição" vazio, use uma tela de confirmação com mensagem própria.
- **Copiar/colar etapas:** menu ⋯ da etapa → Copiar etapa → no **+** do ramo de destino → Colar (1). A etapa colada mantém a configuração, mas referências a saídas de etapas de outro ramo ficam inválidas ("A variável foi excluída") e precisam ser religadas (ex.: documento do "Preparar modelo" do próprio ramo). A etapa **"Gravar dados no Salesforce" não colou** (falha silenciosa).
- Editar um fluxo publicado cria **Rascunho**; publique com **Publicar alterações**.
- Catálogo de etapas (+ → Adicionar uma etapa): abas Início | Docusign | Utilidade | Aplicativos; inclui Coletar dados com Formulários da Web, **Usar API do eSignature** (avançado), Preparar modelo de documento, Preparar modelo do eSignature, Enviar documentos para assinatura, Docusign Identify, regra de várias ramificações, tela de confirmação.
- O passo de confirmação às vezes mostra "Não foi possível carregar esta etapa" → **Recarregar** resolve.
- Destinatário "Usuário que inicia este fluxo" = quem abre o `instance_url` (permite embarcar a jornada inteira num iframe).
### 1.5 Navigator — upload e extrações
- Nome atual na UI: **Agreement Manager** (`/send/navigator`, aba **Acordos → Concluído** = "Documentos preenchidos · Assistido por IA"). Tem busca por palavras-chave/frases, **Planilhas**, **Consultar Iris** (perguntas em linguagem natural) e banner "acordos com datas de notificação de renovação nos próximos 30 dias".
- **Upload de legados:** botão **+** (canto sup. direito, "Adicionar documentos") → **Fazer upload** (do dispositivo) | **Importar do e-mail** (encaminhar anexos — bom argumento para canais) | **Importar dados** (planilha p/ editar metadados em massa).
- Fluxo do upload: (1) Selecionar arquivos + **Nome do trabalho** (até ~758 docs por job) → (2) **Permitir acesso**: adicionar a conjuntos de acordos / compartilhar com usuários e grupos / **pular** (upload privado — visível ao próprio usuário, inclusive via API JWT impersonando-o) → "Upload concluído… processaremos em segundo plano" → **Monitorar o progresso**.
- Cada linha mostra "Upload feito: Ver trabalho"; colunas Partes, Status (Ativo/Inativo, "Renova em…", "Expira em…") e Tipo de Acordo (detectado pela IA).
- ✅ **Resultado da extração (2026-11-16, 14 PDFs pt-BR, ~minutos):** partes (`parties[].name_in_agreement`), `effective_date`, `expiration_date` (100% iguais ao gabarito), `total_agreement_value` + moeda BRL, `renewal_type` (FIXED_TERM/AUTO_RENEW), `renewal_notice_date`, `termination_period_for_convenience` (ex.: P60D), `languages: ["pt"]`, `source_name: "UploadCenter"`. **Não extrai CPF/CNPJ por padrão** — exige **extração customizada** (custom provision) ou cruzar com o CRM (CPF/CNPJ → nome da parte; ver `src/lib/crm.ts`). Tipo pode vir como "Other" — dá para mudar via `PATCH .../agreements/{id}/actions/change-type`.
- O seletor de arquivos é nativo do SO → em automação, o usuário precisa selecionar os arquivos.
### 1.6 Brands / white label
### 1.7 Apps & Keys / consentimento JWT

---

## 2. Padrões de integração (código)

Implementação de referência: `src/lib/docusign/*` (auth, maestro, webforms, esign, navigator, demo-data) + rotas em `src/app/api/docusign/*`. Toda rota devolve `{demo:true}` sem credenciais e `{error, consentUrl}` (401) quando falta consentimento.

| Necessidade | Endpoint (demo) | Scope | Notas |
|---|---|---|---|
| JWT | `requestJWTUserToken` (docusign-esign) em `account-d.docusign.com` | — | Cache em memória, renovar 5 min antes de expirar |
| Disparar workflow | `POST https://api-d.docusign.com/v1/accounts/{a}/workflows/{wf}/actions/trigger` body `{instance_name, trigger_inputs}` | `aow_manage` | Resposta: `instance_id`, `instance_url` (embarcável). Schema: `GET .../trigger-requirements` → `trigger_input_schema[].field_name/field_data_type` |
| Status de workflows | `GET .../workflows/{wf}/instances` | `aow_manage` | Array no topo; `workflow_status` (In Progress/Completed/Canceled/Expired), `last_completed_step_name`, `started_by_name`, `total_steps` |
| Web Form embarcado | `POST https://apps-d.docusign.com/api/webforms/v1.1/accounts/{a}/forms/{formId}/instances` body `{clientUserId, formValues, returnUrl, expirationOffset}` | `signature webforms_instance_write` (+ `webforms_read`, `webforms_instance_read`) | Resposta: `id`, `formUrl`, `instanceToken` (5 min; refresh em `.../instances/{id}/refresh`). Host é **apps-d** com prefixo **/api** |
| Render do Web Form | `https://js-d.docusign.com/bundle.js` → `DocuSign.loadDocuSign(IK)` → `docusign.webforms({url: formUrl, options:{instanceToken, autoResizeHeight:true}})` → `.on('ready'/'submitted'/'sessionEnd')` → `.mount('#el')` | — | Prod: `js.docusign.com` |
| Embedded signing / Focused View | `createRecipientView` com `clientUserId`, `frameAncestors:[appOrigin,'https://apps-d.docusign.com']`, `messageOrigins:['https://apps-d.docusign.com']` | `signature` | Signer precisa ter sido criado com o mesmo `clientUserId`/nome/e-mail |
| Lista de envelopes | `GET /restapi/v2.1/accounts/{a}/envelopes?from_date=ISO&include=recipients&order_by=last_modified&order=desc` | `signature` | `from_date` obrigatório; recipients em `recipients.signers`/`carbonCopies` |
| Repositório / IA | `GET https://api-d.docusign.com/v1/accounts/{a}/agreements?limit=&ctoken=` | `adm_store_unified_repo_read` | Lista em `data[]`; `provisions.*` (effective/expiration_date, total_agreement_value); custom em `custom_provisions`/`additional_*`. Filtros dotted (`provisions.expiration_date`, `parties.name_in_agreement`) — sem OData na REST (o MCP aceita OData `filter`) |

---

### Focused View x embarcado clássico (2026-11-17)
| Onde | Como escolher | Observação |
|---|---|---|
| Assinatura embarcada criada pelo app | `docusign.signing({ url, displayFormat: 'focused' \| 'default' })` (Docusign JS) | Recipient view com `clientUserId` + `frameAncestors` (origem do app + `https://apps-d.docusign.com`) + `messageOrigins: ['https://apps-d.docusign.com']`. URL é de uso único: gere uma nova a cada troca de formato. |
| Web Form embarcado | opção `useFocusedViewForSigning` em `docusign.webforms({ url, options })` (padrão `true`) | Vale para a assinatura gerada após o envio de form baseado em template. Não funciona se o form usa “Initiate signing session from email”. Para trocar, crie nova instância (token de 5 min). |
| Workflow embarcado (`instance_url` em iframe) | não há opção | A assinatura roda na UI do Workflow Builder. |

Implementação: `src/components/SigningEmbed.tsx`, `src/components/WebFormEmbed.tsx`, seletor `src/components/EmbedModeToggle.tsx` (preferência em `localStorage`).
⚠️ O navegador embutido do Claude não captura o conteúdo de iframes da DocuSign em screenshot (fica branco); valide pelo DOM (iframe `apps-d.docusign.com/embedded-signing…`) ou visualmente com o usuário.

## 3. Pegadinhas e limitações (com data)

- **2026-11-16 — Consentimento JWT:** adicionar qualquer scope novo faz o token falhar com `consent_required` (HTTP 400), mesmo com os antigos já consentidos. URL: `https://{authServer}/oauth/auth?response_type=code&scope={scopes %20}&client_id={IK}&redirect_uri=https://developers.docusign.com/platform/auth/consent` — logado como o usuário impersonado. A lista de scopes do consentimento deve conter tudo que o token pede.
- **2026-11-16 — "The redirect URI is not registered properly with Docusign"** no link de consentimento: o `redirect_uri` precisa ser um dos **Redirect URIs** cadastrados na integration key (Admin → Integrações → **Aplicativos e chaves** → Ações → Visualizar detalhes/Editar). Use um já cadastrado (ex.: a URL do site) em vez de `developers.docusign.com/platform/auth/consent`. Diagnóstico rápido: pedir token JWT com `['signature','impersonation', <scope>]` um a um para ver qual scope falta.
- **2026-11-16 — Erros do docusign-esign v8** são estilo axios: detalhe em `err.response.data` (`{error, error_description}`); `err.message` só diz "Request failed with status code 400".
- **2026-11-16 — Navigator sem scope** responde `403 RBAC: access denied` (não é erro de consentimento). Datas vazias vêm como `0001-01-01`. API em beta fechado.
- **2026-11-16 — Web Forms:** configurações de formulário só podem ser criadas na UI (API só cria instâncias). Prefill usa o "API reference name" do componente; checkbox = array de strings; telefone = `{countryCode, nationalNumber}`.
- **2026-11-16 — Next 14 + ESLint flat config:** `next lint` (14.2) não reconhece `eslint.config.mjs` e abre prompt interativo; `next/typescript` não existe no eslint-config-next 14. Use `.eslintrc.json` com `next/core-web-vitals`.
- **2026-11-16 — Não rode `next dev` e `next build` ao mesmo tempo** no mesmo diretório: corrompe `.next` (MODULE_NOT_FOUND / PageNotFoundError `/_document`).
- **2026-11-16 — Upload de arquivos via navegador automatizado:** o navegador embutido do Claude não seleciona arquivos locais; o upload (docx/PDF) precisa ser feito pelo usuário (arrastar ou Ctrl+L no seletor) — planeje esses passos em lote.
- Community: Doc Gen não suporta condições compostas em regras de documento; campos Doc Gen dentro de lógica condicional são gerados mesmo ocultos → separe documentos por variante (ex.: PF e PJ).

---

## 4. Receitas de demo por necessidade de negócio

### 4.1 "Zerar formulários manuais (POPs)"
### 4.2 "PF x PJ com representantes, procuradores e testemunhas"
### 4.3 "Geração + assinatura + status integrado ao canal"
### 4.4 "Pós-assinatura com IA / contratos legados"
### 4.5 "Formulário nativo via API vs. experiência DocuSign embarcada"

---

## WhatsApp delivery por API (17/11/2026)

Signer com `deliveryMethod: "WhatsApp"` e `phoneNumber: {countryCode: "55", number: "11999999999"}` (DDD + número, só dígitos). Sem `email`.

- **Pegadinha:** em `templateRoles`, o `deliveryMethod` é **ignorado** e o envelope volta para e-mail. Use `compositeTemplates`: `serverTemplates` (templateId) + `inlineTemplates.recipients.signers` com o mesmo `roleName` e as `tabs` de pré-preenchimento.
- **Restrições:**
  - WhatsApp não combina com e-mail no mesmo signatário.
  - No máximo 5 destinatários SMS/WhatsApp por envelope.
  - Não dá para usar autenticação por telefone.
  - A mensagem do remetente não é incluída.
- **CC por e-mail:** o CC pode continuar por e-mail; é útil para o apresentador receber a cópia.
- **Teste sem enviar nada:** crie o envelope com `status: "created"` (rascunho) e leia `listRecipients`. O `deliveryMethod` precisa voltar `whatsapp`.
- **Status:** `GET envelopes/{id}?include=recipients` devolve o signer `status` (`sent` → `delivered` quando abre → `completed`). Polling de 5 s é suficiente para demo ao vivo.
- **Narrativa:** "o cliente contrata no portal e assina no WhatsApp, sem e-mail e sem app". Funciona muito bem com o celular do prospect na mão.

## 5. Cases de mercado (por setor)

### Seguros / Vida e Previdência (BR)
- **Icatu** — fechamento de propostas de 15 dias → 1 dia em 60% dos casos; adoção de eSignature 66% → 92%; PowerForms integrado. https://www.docusign.com/pt-br/casos-de-clientes/icatu
- **Tokio Marine** — emissão de apólice de 30+ dias → ~1 hora; 7 mil+ modelos/mês; 138 áreas. https://www.docusign.com/pt-br/casos-de-clientes/tokio-marine
- **SulAmérica** — 150 mil+ folhas economizadas em 2 anos (RH/sindicatos). https://www.docusign.com/pt-br/casos-de-clientes/sulamerica
- **Seguros Unimed** — R$13 mi economizados, processos 70% mais rápidos. https://www.docusign.com/pt-br/casos-de-clientes/seguros-unimed
- **Porto Seguro Vida e Previdência** — desde 2018 em adesão vida/previdência, declaração de saúde, portabilidade (imprensa).
- Página setorial: https://www.docusign.com/pt-br/casos-de-clientes/industria/seguros
- ⚠️ Cases públicos são majoritariamente eSignature/PowerForms (2018-2021). Cases IAM (Bradesco VP, Porto Consórcio, Odontoprev) são citados pelo time comercial, sem página pública — confirmar antes de citar.

---

## 6. Checklist pré-demo (genérico)

- [ ] Token JWT válido e consentimento concedido para TODOS os scopes usados
- [ ] Workflows ativos (status `active`) e IDs no código/env
- [ ] Brand correta (idioma pt_BR) aplicada aos templates
- [ ] Perfil de demo preenchido com e-mail/celular do apresentador
- [ ] Rodar cada jornada uma vez no dia (aquecer + validar)
- [ ] Contratos legados já processados no Navigator (extração leva minutos)
- [ ] Plano B: demo mode do portal funciona sem credenciais
- [ ] Abas abertas: portal, console DocuSign (Workflow Builder, Navigator), Claude com MCP

## 7. Perguntas em aberto (validar com produto/SE)
- IDV: suporte a CNH/RG digital e validação de CPF na Receita?
- ICP-Brasil com certificado em nuvem (assinatura remota)?
- WhatsApp delivery em envelopes disparados por Workflow Builder / embedded? (por API eSignature: OK, ver §WhatsApp)
- White label completo do Web Form (domínio, textos, CSS)?
- Residência de dados BR para Navigator (LGPD)?
