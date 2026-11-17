// Cria (via eSignature API) o template Doc Gen "Fontara Seguros - Proposta de Seguro (Cotacao)" usado pela cotação do site (H1).
// Uso: node scripts/create-cotacao-template.mjs [--force]   (lê credenciais do .env.local)
// Doc Gen por API: o .docx com {{Campos}} precisa entrar numa chamada SEPARADA (TemplateDocuments:update)
// para o DocuSign detectar os campos; se for no Templates:create, vira documento comum.
// O "name" do documento precisa terminar em .docx, senão: FORMAT_CONVERSION_ERROR.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import docusign from 'docusign-esign'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '')
}
const env = process.env
const NAME = 'Fontara Seguros - Proposta de Seguro (Cotacao)'
const BRAND_ID = 'd892d79e-b9b2-4a4c-9349-dd9d30044ac5' // pt_BR

const api = new docusign.ApiClient()
api.setOAuthBasePath(env.DOCUSIGN_AUTH_SERVER || 'account-d.docusign.com')
const key = Buffer.from(env.DOCUSIGN_PRIVATE_KEY.replace(/\\n/g, '\n'))
const tok = await api.requestJWTUserToken(env.DOCUSIGN_INTEGRATION_KEY, env.DOCUSIGN_USER_ID, ['signature', 'impersonation'], key, 3600)
const base = `${env.DOCUSIGN_BASE_PATH || 'https://demo.docusign.net/restapi'}/v2.1/accounts/${env.DOCUSIGN_ACCOUNT_ID}`
async function ds(method, p, body) {
  const r = await fetch(base + p, { method, headers: { Authorization: `Bearer ${tok.body.access_token}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`${method} ${p} -> ${r.status} ${JSON.stringify(j)}`)
  return j
}

// Reaproveita um template de mesmo nome que ficou sem documento (ex.: falha na conversão do .docx).
let templateId
const found = await ds('GET', `/templates?search_text=${encodeURIComponent(NAME)}`)
const hit = (found.envelopeTemplates || []).find((t) => t.name === NAME)
if (hit && !process.argv.includes('--force')) {
  const docs = await ds('GET', `/templates/${hit.templateId}/documents`)
  if ((docs.templateDocuments || []).length) { console.log(`Já existe: ${hit.templateId} (use --force para criar outro)`); process.exit(0) }
  templateId = hit.templateId
}

if (!templateId) {
  const tpl = await ds('POST', '/templates', {
    name: NAME,
    description: 'Proposta de seguro gerada por Doc Gen a partir da cotação do site (demo H1). Signatário embarcado (Focused View / clássica).',
    emailSubject: 'Fontara Seguros - Proposta de Seguro para assinatura',
    brandId: BRAND_ID,
    shared: 'false',
    status: 'created',
    recipients: { signers: [{ roleName: 'Proponente', recipientId: '1', routingOrder: '1' }] },
  })
  templateId = tpl.templateId
}
const docx = fs.readFileSync(path.join(root, 'docs/demos/assets/doc-gen/Proposta_Seguro_Fontara.docx'))
await ds('PUT', `/templates/${templateId}/documents/1`, {
  documents: [{ documentId: '1', name: 'Proposta de Seguro Fontara.docx', fileExtension: 'docx', order: '1', documentBase64: docx.toString('base64') }],
})
await ds('POST', `/templates/${templateId}/recipients/1/tabs`, {
  signHereTabs: [{ tabLabel: 'AssinaturaProponente', anchorString: '/assinatura_proponente/', anchorUnits: 'pixels', anchorXOffset: '0', anchorYOffset: '-6', anchorIgnoreIfNotPresent: 'true' }],
  dateSignedTabs: [{ tabLabel: 'DataProponente', anchorString: '/data_proponente/', anchorUnits: 'pixels', anchorYOffset: '-3', anchorIgnoreIfNotPresent: 'true', fontSize: 'size8' }],
})
console.log(`Template criado: ${templateId}`)
