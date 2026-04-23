# Fontara Seguros — Portal

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Netlify (deploy + serverless functions)
- DocuSign eSign API (JWT auth) for e-signature demonstrations

## Structure
```
src/
  app/
    api/docusign/envelope/route.ts  ← Next.js API route (local dev + Netlify)
    layout.tsx / page.tsx / globals.css
  components/
    Navbar, Hero, Seguros, ComoFunciona, Diferenciais, Depoimentos, CotacaoForm, Footer
netlify/functions/
  docusign-envelope.ts  ← Netlify Function (alternative deployment path)
public/
  logo.png
```

## DocuSign Integration
- API route: `POST /api/docusign/envelope`
- Accepts: signerName, signerEmail, cpf, phone, tipoSeguro, valorCobertura, observacoes
- Returns: envelopeId, signingUrl (embedded signing ceremony), status
- **Demo mode**: If env vars are not set, returns a simulated response (envelopeId = DEMO-{timestamp})

## Environment Variables
Copy `.env.local.example` to `.env.local` and fill in DocuSign credentials.
See `.env.local.example` for details.

## Commands
```bash
npm install
npm run dev    # http://localhost:3000
npm run build
npm run lint
```

## Netlify Deploy
- `netlify.toml` is configured
- Requires `@netlify/plugin-nextjs` package
- Set env vars in Netlify dashboard under Site Settings > Environment Variables
