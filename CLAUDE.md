# Fontara Seguros — Portal

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Netlify (via `@netlify/plugin-nextjs`; no serverless functions)
- DocuSign IAM: eSignature, Workflow Builder (Maestro), Web Forms, Doc Gen, Navigator
- Authentication: mock login with client/vendor personas, localStorage `fontara_demo_profile`

## Project Structure
```
src/
  app/
    page.tsx                           ← Public home
    layout.tsx
    api/docusign/
      maestro/route.ts                 ← Trigger workflows (Workflow Builder)
      maestro/instances/route.ts       ← Poll workflow status
      envelopes/route.ts               ← List/search envelopes (eSignature)
      envelope/route.ts                ← Create single envelope (legacy)
      webforms/instance/route.ts       ← Create Web Form instance
      signing-view/route.ts            ← Embedded Focused View signing
      agreements/route.ts              ← Navigator search + AI insights
      consent/route.ts                 ← JWT consent URL (401 handler)
    area-cliente/
      page.tsx                         ← Client dashboard (maestro, resgate, contratos)
      perfil/page.tsx                  ← Demo profile editor (Maestro + live preview)
      login/page.tsx
    canal/
      page.tsx                         ← Vendor portal
      login/page.tsx
      nova-jornada/[slug]/page.tsx     ← Route journey by catalog slug
      acompanhamento/page.tsx          ← Journey status tracker
      contratos/page.tsx               ← Agreement search
    demo/page.tsx                      ← Public demo showcase
  lib/docusign/
    auth.ts                            ← JWT (cached, 5-min refresh margin), ConsentRequiredError
    maestro.ts                         ← Workflow Builder API
    webforms.ts                        ← Web Forms instance creation + render
    esign.ts                           ← eSignature envelope operations
    navigator.ts                       ← Navigator/Agreement Manager queries
    demo-data.ts                       ← Mock responses when env vars missing
  lib/
    journeys.ts                        ← Journey catalog (slug, POP code, workflow IDs, modes)
    defaultProfile.ts                  ← Mock personas (PF/PJ with reps/witnesses)
    br.ts                              ← Brazilian helpers (CPF/CNPJ formatting)
  components/
    Navbar, Hero, Seguros, ComoFunciona, Diferenciais, Depoimentos, Footer
    CotacaoForm                        ← Public quotation form (unused; demo form)
    MaestroModal                       ← Embeds workflow instance_url in iframe
    WebFormEmbed                       ← Embeds Web Form via DocuSign JS loader
    WebFormJourney                     ← "Resgate/Portabilidade" Web Form demo
    JourneyForm                        ← Route journey form (inputs → Maestro trigger)
    StatusTimeline                     ← Workflow step display
    AgreementSearch                    ← Navigator search + display
    DocusignEmbedModal                 ← eSignature Focused View modal
  context/
    AuthContext.tsx                    ← Session (cliente/vendedor), demo profile persistence
  types/
    demo.ts                            ← DemoProfile, Journey, MaestroTriggerRequest, etc.
    docusign-esign.d.ts                ← Type stubs (docusign-esign v8)
  
  .eslintrc.json                       ← next/core-web-vitals
  
  netlify.toml                         ← Build config + env var hints
```

## DocuSign Integration

### Demo Behavior
- **No env vars set?** All routes return `{demo:true}` with mock data (workflow IDs, envelopes, etc.)
- **Env vars set but no JWT consent?** Route returns `{error, consentUrl}` (401 status) → user redirects to DocuSign OAuth
- **Consent granted?** Full API access

### Key Endpoints
| Route | Method | Purpose | Returns |
|-------|--------|---------|---------|
| `/api/docusign/maestro` | POST | Trigger workflow by ID or journey slug | `{instanceId, embeddedUrl, demo?}` or `{error, consentUrl}` (401) |
| `/api/docusign/maestro/instances` | GET | Poll workflow instance status | `{instances: [{id, status, lastStep, ...}]}` |
| `/api/docusign/webforms/instance` | POST | Create Web Form instance + render token | `{id, url, instanceToken}` |
| `/api/docusign/envelopes` | GET | List envelopes with optional filter | `{envelopes: [{id, status, recipients, ...}]}` |
| `/api/docusign/agreements` | GET | Navigator search (AI insights, expiry dates) | `{agreements: [{id, type, parties, provisions, ...}]}` |
| `/api/docusign/consent` | GET | JWT consent URL | Redirect or `{consentUrl}` |

### Core Modules (`src/lib/docusign/`)
- **auth.ts**: JWT token cache (renewed 5 min before expiry), `ConsentRequiredError` for 401 handling
- **maestro.ts**: Workflow instance creation + polling
- **webforms.ts**: Form instance creation + token refresh
- **esign.ts**: Envelope CRUD + signing ceremonies
- **navigator.ts**: Agreement search, filtering, custom fields
- **demo-data.ts**: Mock responses for demo account "Fontara Financial" (ec21792a-93fd-42e6-b819-8ae005bf5023)

### Journey Catalog (`src/lib/journeys.ts`)
```typescript
// Add a new POP = add one entry with workflow IDs (empty IDs = demo mode)
export const JOURNEYS: Journey[] = [
  { slug: 'proposta', popCode: 'POP-VP-001', title: '...', 
    workflowId: 'xyz', embeddedWorkflowId: 'abc', ... },
  { slug: 'resgate-portabilidade', popCode: 'POP-VP-014', 
    formId: 'b5a06678-688d-4243-952f-f0dccb9a19c7', ... },
  // Add more...
]
```

## Authentication & Demo Profile
- **Mock login**: `AuthContext` supports `cliente` / `vendedor` personas
- **localStorage**: `fontara_demo_profile` stores DemoProfile (PF/PJ, reps, witnesses)
- **Session tracking**: `fontara_session` holds active login (persona + email)
- **Default profile**: João Silva (CPF valid) + mock company "Padaria Bom Pão" (CNPJ valid)

## Environment Variables
See `.env.local.example`:
```
DOCUSIGN_INTEGRATION_KEY=...
DOCUSIGN_USER_ID=...
DOCUSIGN_ACCOUNT_ID=...
DOCUSIGN_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
DOCUSIGN_BASE_PATH=https://demo.docusign.net/restapi        # or prod
DOCUSIGN_AUTH_SERVER=account-d.docusign.com                 # or account.docusign.com
DOCUSIGN_MAESTRO_BASE_URL=https://api-d.docusign.com/v1
DOCUSIGN_WEBFORMS_BASE_URL=https://apps-d.docusign.com/api/webforms/v1.1
DOCUSIGN_NAVIGATOR_BASE_URL=https://api-d.docusign.com/v1
DOCUSIGN_MAESTRO_WORKFLOW_ID=...                            # (optional; can override via journey)
DOCUSIGN_SCOPES=signature impersonation aow_manage webforms_read webforms_instance_read ...
DOCUSIGN_CONSENT_REDIRECT_URI=https://fontaraseguros.netlify.app/
```

## Knowledge Base
**→ `/docs/DEMO-PLAYBOOK.md`** — Reusable DocuSign demo patterns (product map, platform navigation, API recipes, demo account IDs). **Read before building demos; append new learnings with dates.** This is the user's reference for demos across projects.

## Commands
```bash
npm install
npm run dev      # http://localhost:3000 (do NOT run build while dev is running — shared .next)
npm run build
npm run lint     # Uses .eslintrc.json (next/core-web-vitals)
```

## Netlify Deploy
- `netlify.toml` configured for Next.js (via `@netlify/plugin-nextjs`)
- Set env vars in Netlify Dashboard → Site Settings → Environment Variables
- No manual serverless functions needed (next/api routes auto-deployed)
