# Handoff: estado do projeto para retomada

> Leia este arquivo primeiro ao retomar o projeto. Depois leia, nesta ordem:
> 1. Playbook DocuSign compartilhado (skill `docusign-demo-playbook`, clone de https://github.com/ArthurPuccinelli/docusign-demo-playbook em `~/.claude/skills/`): conhecimento reutilizável. Os hooks fazem `git pull` e injetam o índice no início da sessão; aprendizados viram PR via `scripts/contribute.sh`. Instalação: [`DEMO-PLAYBOOK.md`](DEMO-PLAYBOOK.md).
> 2. [`demos/caixa-vida-previdencia.md`](demos/caixa-vida-previdencia.md): roteiro e IDs do cliente.
> 3. [`../public/demo-map.html`](../public/demo-map.html): mapa da demo para o apresentador, publicado em `/demo-map`.
>
> Última atualização: **17/11/2026**.

## 1. O que é
Portal fictício **Fontara Seguros** (Next.js 14 + Tailwind, Netlify) que demonstra **DocuSign IAM** para a **Caixa Vida e Previdência**. A dor do cliente é "zerar os POPs" (formulários manuais).

- **Público:** https://fontaraseguros.netlify.app
- **Mapa da demo:** https://fontaraseguros.netlify.app/demo-map
- **Roteiro:** https://fontaraseguros.netlify.app/demo
- **Conta DocuSign demo:** "Fontara Financial", `ec21792a-93fd-42e6-b819-8ae005bf5023`, ambiente developer (`apps-d` / `demo.docusign.net`).

## 2. Regras de trabalho (preferências do usuário)
- Responder em **pt-BR**.
- **Nunca** ler nem imprimir `.env.local` (tem a chave privada). Scripts podem carregá-lo em tempo de execução.
- O usuário faz o login na DocuSign e clica em consentimentos/OAuth. Nunca digitar senha.
- **Envio real** de envelope ou mensagem só com autorização.
  - E-mail de teste autorizado: `arthurdocusign+IAM@gmail.com`.
  - Para WhatsApp, confirmar o número antes de enviar.
- **Commit e push só quando pedido.** O remoto se chama **`Fontara-Seguros`**, não `origin`. Push com:
  `git -c credential.helper= -c credential.helper='!gh auth git-credential' push Fontara-Seguros main`
  O Netlify publica sozinho em cerca de 1 min.
- Não rodar `npm run build` com o `npm run dev` ativo, porque os dois compartilham `.next`.
- O dev server vem de `.claude/launch.json` ("dev", porta 3000).
- O conhecimento genérico vai para o playbook global (`~/.claude/skills/docusign-demo-playbook/PLAYBOOK.md`), com data e sem IDs de cliente. O que é específico da Caixa vai para `demos/caixa-vida-previdencia.md`.
- **Estilo de UI pedido:**
  - Áreas logadas sem "cara de IA": nada de grade de cards com ícone colorido nem gradiente. Preferir layout editorial (listas, tabelas, linhas finas).
  - Modais de embed simples: sem título, borda navy (`EmbedShell`).
  - Menu da home em uma linha só.

## 3. Mapa das demos
| Código | Onde | O que mostra | Peças DocuSign |
|---|---|---|---|
| H1 | Home → Cotação → Assinar agora | Formulário do portal → proposta **Doc Gen por API** → assinatura embarcada (Focused View ⇄ Clássica) | Template Doc Gen `fe5d08f8` |
| H2 | Home → Como funciona → Contrate agora | Workflow embarcado (Web Form → ramificação por produto → **Modelos de documentos** → assinatura → Salesforce) | Workflow `0359ae48` |
| C1 | Área do Cliente → PGBL → Resgatar ou portar | Web Form pré-preenchido por API, embarcado, com regras condicionais → assinatura embarcada | Web Form `b5a06678`, template `87db4535` |
| C2 | Área do Cliente → Pendências → Confirmar agora | Workflow embarcado com Salesforce (sem documento) | Workflow `98e2f24c` |
| C3 | Área do Cliente → Documentos | Navigator filtrado pelo CPF do perfil | Agreement Manager |
| C4 | Área do Cliente → Contratação pelo WhatsApp (e Canal POP-VP-002) | Plano → celular → envelope com **entrega por WhatsApp** → trilha de status por polling | Template PF `8e999bc2` via compositeTemplates |
| C5 | Área do Cliente → produto → Alterar beneficiários | Formulário do portal → modelo de envelope ligado a um **Modelo de documento** (tabela dinâmica + cláusulas condicionais + assinatura no modelo) → assinatura embarcada (Focused View ⇄ Clássica) | Modelo de documento `52cca5f1`, modelo de envelope `fdd421a2` |
| V1 | Canal → Jornadas → POP-VP-001 → Formulário do portal | Form nativo PF/PJ (representantes, testemunhas) → trigger do workflow com 30 variáveis | Workflow `824dd961`, templates PF `8e999bc2` / PJ `d47237d8` |
| V2 | Canal → mesma jornada → Experiência embarcada | Igual à H2 | Workflow `0359ae48` |
| V3 | Canal → Acompanhamento | Instâncias de workflow e envelopes (refresh a cada 15 s) | Maestro + eSignature |
| V4 | Canal → Contratos | Busca Navigator por CPF/CNPJ e vencimento (14 contratos legados) | Agreement Manager |
| D1, D2 | Fora do portal | Console DocuSign; Claude + Docusign MCP | — |

**Modelos de documentos** (biblioteca Doc Gen) aparecem em **H2, V2 e C5**. Em H2 e V2:
- Vida usa "Proposta padrão Vida".
- Empresarial e Auto usam "Empresarial e Patrimonial".

## 4. Código: onde está cada coisa
- `src/lib/docusign/auth.ts`:
  - JWT com cache e `ConsentRequiredError`.
  - `dsFetch` faz uma nova tentativa em falha de rede e mostra `err.cause` no erro.
- `src/lib/docusign/esign.ts`:
  - recipient view (Focused View);
  - `createProposalEnvelope` (H1, Doc Gen: rascunho → `docGenFormFields` → envio);
  - `buildCotacaoFields` (coberturas e prêmio por produto);
  - `createWhatsAppProposal` / `getWhatsAppStatus` (C4);
  - `createBeneficiariosEnvelope` (C5: campos por label + tabela dinâmica `TableRow`).
- `src/lib/docusign/{maestro,webforms,navigator,demo-data}.ts`.
- `src/lib/crm.ts`: mapa CPF/CNPJ → nome. A IA do Navigator não extrai documento.
- `src/lib/journeys.ts`: catálogo de POPs. Novo POP = nova entrada.
- `src/lib/embedMode.ts`: preferência Focused View/Clássica no localStorage.
- **Rotas** (`src/app/api/docusign/`): `maestro`, `maestro/instances`, `webforms/instance`, `signing-view`, `envelope` (H1), `envelopes`, `agreements`, `whatsapp` (POST envia, GET status), `beneficiarios` (C5), `consent`.
- **Componentes principais:**
  - `EmbedShell`, `SigningEmbed`, `WebFormJourney`, `WhatsAppJourney`, `BeneficiariosJourney`.
  - `JourneyForm`, `MaestroModal`, `DocusignEmbedModal`, `AgreementSearch`, `CotacaoForm`.
- **Páginas:**
  - `/area-cliente`: visão de conta com produtos, pendências e serviços.
  - `/canal` (layout com cabeçalho em uma linha):
    - aba Jornadas: cliente em atendimento + tabela de POPs;
    - `nova-jornada/[slug]`;
    - `acompanhamento`;
    - `contratos`.
- **Scripts** (criam templates por API e carregam `.env.local`):
  - `scripts/create-proposta-templates.mjs`;
  - `scripts/create-resgate-template.mjs`;
  - `scripts/create-cotacao-template.mjs`. É idempotente: reaproveita um template de mesmo nome sem documento; `--force` cria outro.
- **Ativos:**
  - `docs/demos/assets/build_proposta_seguro.py` (python-docx; gera o .docx da cotação com o logo `doc-gen/fontara-logo.png`);
  - `generate.py` (contratos legados e PDFs das propostas).

## 5. Estado dos artefatos na conta (17/11/2026)
| Artefato | ID | Estado |
|---|---|---|
| Workflow "Fontara Seguros - Proposta PF/PJ (API)" | `824dd961-5586-4eea-b3af-52d2c3e927f9` | publicado, validado PF e PJ |
| Workflow "Onboarding de cliente portal" | `0359ae48-47dc-45be-a7b8-9ae20894eaba` | publicado; ramo Auto testado |
| Workflow "Portal atualizacao de cadastro Salesforce" | `98e2f24c-e903-4692-b599-21fd8214e04e` | publicado |
| Web Form Resgate/Portabilidade | `b5a06678-688d-4243-952f-f0dccb9a19c7` | ativo |
| Template Doc Gen "Proposta de Seguro (Cotacao)" | `fe5d08f8-ae51-40db-9b08-f1a69ad36351` | ativo (H1) |
| Templates eSignature Proposta PF / PJ | `8e999bc2-0e93-4917-84b3-315fc0ae97f9` / `d47237d8-e695-4b77-93a8-5164b581d29f` | ativos (V1, C4) |
| Modelo de documento "Fontara Seguros - Alteração Beneficiários" | `52cca5f1-a378-444e-aede-600250756e12` | publicado (v4), usado pelo modelo de envelope `fdd421a2` (C5) |
| Modelo de documento "Proposta de Adesao PF" | `92a21226-566d-4792-90de-750de2eff402` | **não publicado, sem campos mapeados; nenhuma demo usa** |
| Agreement Manager "Legados Vida e Previdencia" | 14 PDFs | processados |

Limpo em 17/11: o rascunho do workflow "Fluxo de Proposta de Adesão por API", os templates "TESTE docgen api" e os envelopes de teste. Não há workflow em rascunho nosso.

## 6. Pendências
**Usuário:**
- [ ] Conferir **C1 Resgate** no site publicado, abrindo e trocando Focused View ⇄ Clássica. Antes da correção dava "fetch failed"; foi uma falha de rede passageira, e agora há uma nova tentativa automática.

**Opcional (decidir se vale):**
- [ ] Mapear os campos do modelo de documento `92a21226` (PF) e criar o PJ, para mostrar a biblioteca Modelos de documentos também no V1. Hoje o V1 usa template eSignature e funciona. Se decidir que não vale, o `92a21226` pode ser apagado.

**Claude:**
- [ ] Antes de encerrar uma sessão, conferir `git status -sb`: se aparecer "ahead", há commits sem push.
- [ ] Ao mexer em demos, atualizar juntos: `public/demo-map.html`, `src/app/demo/page.tsx`, o runbook da Caixa e o playbook.

## 7. Pegadinhas que já custaram tempo (detalhes no playbook)
- **WhatsApp:**
  - `deliveryMethod` em `templateRoles` é ignorado e o envio volta para e-mail. Use `compositeTemplates` + `inlineTemplates`.
  - WhatsApp não combina com e-mail no mesmo signatário.
- **Doc Gen por API:**
  - O .docx entra num `PUT /templates/{id}/documents/1` separado.
  - O nome do documento precisa terminar em `.docx` (senão, `FORMAT_CONVERSION_ERROR`).
  - O `documentId` do `docGenFormFields` é um GUID.
  - `PUT` de tabs de template não muda `anchorYOffset`: é preciso apagar e recriar.
- **Workflow Builder:**
  - O mapeamento com IA ("Mapeie para mim") desloca campos; confira um a um.
  - Todo ramo precisa de uma etapa para publicar.
  - A sessão expira em cerca de 1 h; salve a cada etapa.
- **Focused View:**
  - Precisa de `frameAncestors` (origem do app + `https://apps-d.docusign.com`) e `messageOrigins`.
  - A URL de assinatura é de uso único; recrie a cada troca de modo.
  - Não existe Focused View dentro de workflow embarcado.
- **Validação visual:** screenshots não mostram o conteúdo dos iframes DocuSign. Valide pela API (abas, PDF do envelope) ou peça ao usuário.
- **Navigator:**
  - A IA não extrai CPF/CNPJ; por isso existe o mapa em `src/lib/crm.ts`.
  - A busca livre diferencia acentos.
- **Limpeza:**
  - Templates: `PUT /folders/recyclebin` com `envelopeIds`.
  - Rascunhos: `PUT status voided` (ficam `deleted`).

## 8. Como verificar rápido
```bash
npx tsc --noEmit -p . && npm run lint
curl -s -X POST localhost:3000/api/docusign/webforms/instance -H 'Content-Type: application/json' -d '{"journey":"resgate-portabilidade","clientUserId":"a@b.com","formValues":{}}' | head -c 120
```
Login simulado: qualquer e-mail e senha. No navegador:
- cliente: `localStorage.fontara_session = {"persona":"cliente","email":"..."}`;
- canal: `{"persona":"vendedor",...}`.
