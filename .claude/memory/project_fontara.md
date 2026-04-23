---
name: Fontara Seguradora Portal
description: Contexto técnico e de produto do portal Fontara Seguradora
type: project
---

## Produto
Portal web moderno de seguradora digital — Fontara Seguradora.

## Serviços principais
- Seguro Auto
- Seguro de Vida
- Seguro Empresarial

## Stack técnica
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- Netlify (hosting + serverless functions em `netlify/functions/`)
- Integração futura com DocuSign (via funções serverless)

## Paleta de cores (da logo)
- Primary (verde floresta escuro): `#1C3A32`
- Primary Dark: `#0F211B`
- Accent (verde menta): `#3DFFC0`
- Accent Dark: `#00D4A8`
- Text muted: `#5A7A70`
- Border: `#D4EDE6`
- Surface: `#F7FDFB`

## Tipografia
- IBM Plex Sans (Google Fonts) — confiança, profissional, financeiro

## Logo
- Arquivo: `public/logo.png` (também na raiz como `Fontara logo.png`)
- Na navbar: `brightness(0) invert(1)` quando sobre fundo escuro

## Estrutura de componentes
- `src/components/Navbar.tsx` — navbar com dropdown de seguros, fixa com glassmorphism no scroll
- `src/components/Hero.tsx` — hero com gradiente verde escuro + formulário de cotação rápida
- `src/components/Seguros.tsx` — cards dos 3 produtos (Auto, Vida, Empresarial)
- `src/components/ComoFunciona.tsx` — 4 passos do processo
- `src/components/Diferenciais.tsx` — 6 diferenciais + barra de stats
- `src/components/Depoimentos.tsx` — 6 depoimentos de clientes
- `src/components/CotacaoForm.tsx` — formulário de cotação completo com seleção de tipo
- `src/components/Footer.tsx` — footer com links e contato

## Serverless
- `netlify/functions/cotacao.ts` — endpoint POST para receber cotações. TODO: integrar DocuSign e email.
- `netlify.toml` — configurado com `@netlify/plugin-nextjs`

## Status atual (2026-04-23)
Build concluído e funcionando. Dev server em localhost:3000.
Próximo passo: integração com DocuSign via funções serverless.
