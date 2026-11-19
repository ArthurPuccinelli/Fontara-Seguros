# Demo — Caixa Vida e Previdência ("Do POP ao acordo inteligente")

> Específico deste cliente. Conhecimento genérico: playbook global `~/.claude/skills/docusign-demo-playbook/PLAYBOOK.md` (ver [`../DEMO-PLAYBOOK.md`](../DEMO-PLAYBOOK.md)).
> Portal: Fontara Seguros (marca fictícia). Conta DocuSign demo: **Fontara Financial** `ec21792a-93fd-42e6-b819-8ae005bf5023`.

## Contexto (reunião 10/11/2026 — Gong)
- **Fabio Sottilo** (Superintendente Estratégia de Clientes/Canais) — dor: "zerar os POPs" (cobrança anual da diretoria). Perfil inovação (MIT). Percepção: DocuSign "engessada" no passado → criaram solução caseira.
- **Jhimmy Isabel** (operações de jornadas / experiência do vendedor) — trouxe PF x PJ; PJ = representante legal + testemunhas "depende do formulário". Prefere **embarcado no sistema deles**.
- **Ismael Marani** (canal banco e canal parceiro).
- Fernando (AE) prometeu: arquiteto + 3–4 casos de automação de formulários, embarcado em site, cases (Bradesco VP, Porto Consórcio, Odontoprev).

## Critérios de decisão → onde aparece na demo
| Critério | Demo |
|---|---|
| Reduzir efetivamente formulários manuais | Catálogo `/canal` (POP-VP-001, POP-VP-014, POP-CAD-003) — "novo POP = nova entrada" |
| Flexibilidade p/ múltiplas jornadas e regras | 1A (regras no formulário do portal) e 1B (regras no Workflow Builder) |
| Integração/incorporação aos canais | 1A via API (payload JSON visível) e 1B/1C embarcados |
| PF, PJ, representantes, testemunhas | Proposta PF/PJ (1–3 representantes, procurador, 2 testemunhas opcionais) |
| Cases semelhantes | Icatu, Tokio Marine, SulAmérica, Seguros Unimed, Porto VP (playbook §5) |
| Evolução da plataforma | Workflow Builder, Web Forms, Doc Gen, Navigator/Iris, MCP — nada disso existia "2 anos atrás" |
| Adoção por vendedores/operação | Portal do canal com catálogo + acompanhamento |
| Escalar sem recriar POPs | Workflow Builder versionado + catálogo config-driven |

## Roteiro (≈ 45 min)
0. **Abertura (2 min)** — `/demo`. "Vamos mostrar a jornada de um POP do início ao fim, embarcada no canal."
1. **1A — Proposta PF/PJ no portal do canal, via API (8 min)** — `/canal/nova-jornada/proposta`. Mostrar PF → trocar para PJ, adicionar 2 representantes + testemunhas. Enviar. Abrir "Ver payload enviado à API" (fala p/ TI: *o formulário é de vocês; a DocuSign orquestra*). E-mail/SMS chega no celular do apresentador.
2. **1B — Mesma proposta, experiência DocuSign embarcada (6 min)** — `/canal/nova-jornada/proposta?modo=embarcado`. Fala: *mudar o POP = editar o workflow, sem deploy*. Abrir o Workflow Builder e mostrar a ramificação PF/PJ.
3. **1C — Cliente final: Resgate/Portabilidade (6 min)** — `/area-cliente` → card Resgate. Web Form condicional (total/parcial/portabilidade) pré-preenchido → assinatura Focused View.
4. **2/3 — Acompanhamento (4 min)** — `/canal/acompanhamento`: instâncias + envelopes, etapa atual.
4b. **C4 — Contratação pelo WhatsApp (4 min)** — `/area-cliente` → bloco "Contratação pelo WhatsApp" → Ver planos → confirmar celular. A mensagem chega no WhatsApp; a trilha na tela avança até "assinada".
4c. **C5 — Alteração de beneficiários (4 min)** — `/area-cliente` → Vida Família → Alterar beneficiários. Mostre a tabela crescendo e as cláusulas mudando (Vida × PGBL, menor). Depois, abra o modelo em Modelos de documentos, edite uma frase, publique e gere de novo: o site já reflete.
5. **4 — Pós-assinatura com IA (8 min)** — Navigator com 14 contratos legados; `/canal/contratos`: CPF/CNPJ, "vence em 90 dias". Fechar com Claude + Docusign MCP: "Quais contratos do CNPJ 55.318.076/0001-51 vencem nos próximos 90 dias?" (história do WhatsApp do Fernando).
6. **Fechamento (5 min)** — proposta de piloto com 1 POP real deles.

## IDs na conta demo
| Artefato | ID | Status |
|---|---|---|
| Template eSignature Resgate/Portabilidade (base do Web Form) | `87db4535-9f10-4eb2-abd8-6b430349fe75` | criado via API (`scripts/create-resgate-template.mjs`) |
| Modelo de documento Doc Gen — Proposta PF | `92a21226-566d-4792-90de-750de2eff402` | aguardando mapeamento de campos |
| Modelo de documento Doc Gen — Proposta PJ | — | pendente (mapeamento no final, com o usuário) |
| Template eSignature Proposta PF (anchors, roles Titular + CC Corretor) | `8e999bc2-0e93-4917-84b3-315fc0ae97f9` | criado via API (`scripts/create-proposta-templates.mjs`) |
| Template eSignature Proposta PJ (Rep1–3, Testemunha1–2, CC Corretor) | `d47237d8-e695-4b77-93a8-5164b581d29f` | criado via API |
| Web Form Resgate/Portabilidade | `b5a06678-688d-4243-952f-f0dccb9a19c7` | ativo (3 regras) |
| Workflow Proposta PF/PJ (API) — "Fontara Seguros - Proposta PF/PJ (API)" | `824dd961-5586-4eea-b3af-52d2c3e927f9` | publicado (Start API c/ 30 variáveis → PF/PJ → template → envio remoto → confirmação) |
| Workflow embarcado (1B) — reaproveita "Fontara Seguros - Onboarding de cliente portal" | `0359ae48-47dc-45be-a7b8-9ae20894eaba` | ativo; ramo Auto testado pelo usuário 17/11/2026 (Web Form → ramificação Empresarial/Vida/Auto → Doc Gen → assinatura → Salesforce) |
| Teste E2E 1A (PF) | instância `41b0774c…`, envelope `d45d268f…` | OK 16/11/2026 — envelope recebido pelo Titular + CC Corretor, campos do template preenchidos corretamente pelas variáveis do trigger |
| Workflow Atualização cadastral (existente) | `98e2f24c-e903-4692-b599-21fd8214e04e` | ativo |
| Brand pt_BR | `d892d79e-b9b2-4a4c-9349-dd9d30044ac5` (Fontara Financial) | existente |

| Teste E2E 2 (PJ) | instância `0edd347a…`, envelope `3761214a…` | OK 16/11/2026 — Rep1, Rep2, Test1, Test2 + CC Corretor; Rep3 vazio omitido (roteamento variável) |
| Template Doc Gen da cotação (H1) — "Fontara Seguros - Proposta de Seguro (Cotacao)" | `fe5d08f8-ae51-40db-9b08-f1a69ad36351` | criado via API 17/11/2026 (`scripts/create-cotacao-template.mjs`); coberturas/prêmio por produto em `buildCotacaoFields` |
| Beneficiários (C5) — Modelo de documento "Fontara Seguros - Alteração Beneficiários" | `52cca5f1-a378-444e-aede-600250756e12` (v4) | publicado 19/11/2026: campos de remetente, tabela dinâmica `Beneficiarios` (Nome/Parentesco/Percentual), regra "Clausula Vida" com 2 variantes (Produto = Vida / Previdência), "Clausula Menor" (TemMenor = Sim), Assinatura + Data do Signatário 1 |
| Beneficiários (C5) — Modelo de envelope "Fontara Seguros - Alteracao de Beneficiarios (embarcado)" | `fdd421a2-7ec1-4f6f-ad46-edea1a9e6301` | usa o modelo de documento acima (papel "Signatário 1" vinculado); `POST /api/docusign/beneficiarios` + assinatura embarcada; validado E2E 19/11/2026 |
| Contratação WhatsApp (C4 / POP-VP-002) | `POST /api/docusign/whatsapp` → template PF `8e999bc2…` via compositeTemplates, titular `deliveryMethod: WhatsApp` | rascunho validado 17/11/2026 (`deliveryMethod: whatsapp` no recipient); envio real depende do número do apresentador |
| Correções 16/11 | Workflow PF/PJ: remapeados campos PJ (IA tinha deslocado Rep1–3, Nº proposta, testemunhas), Cnpj e Corretor; Onboarding: ramo Auto completado (Preparar modelo Empresarial e Patrimonial + assinatura) e ramo sem condição com tela própria | validado: envelope PJ `c767256b…` com todos os campos corretos |

Mapa visual da demo (rotas, falas, IDs, checklist): `public/demo-map.html` — no site em https://fontaraseguros.netlify.app/demo-map (também publicado em https://claude.ai/artifact/5z42TrDxJ5Z8aHaaXMMHUZ)

## Dados de demo
- Contratos legados: `assets/legados/` + gabarito `assets/legados/INDEX.md` (rodar `python assets/generate.py` antes da demo para atualizar vencimentos).
- Perfil do apresentador: `/area-cliente/perfil` (salvo no navegador).

## Perguntas em aberto para o cliente
- Quais 3 POPs de maior volume (para piloto)? Quais exigem testemunha?
- Sistema dos canais (banco/parceiro) — onde embarcar? (CRM? portal próprio?)
- Assinatura PJ: aceitam eletrônica simples para representante ou exigem ICP-Brasil?
