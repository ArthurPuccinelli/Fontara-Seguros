// Cria (via eSignature API) os templates "Fontara Seguros - Proposta de Adesao PF/PJ" usados pelo Workflow Builder.
// Uso: node scripts/create-proposta-templates.mjs [--force]   (lê credenciais do .env.local)
// Se um template com o mesmo nome já existir, imprime o id e pula (use --force para criar outro).
// Campos posicionados por âncora: os placeholders {{Campo}} estão em branco/6pt no PDF (generate.py -> build_proposta_pdf).
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
const force = process.argv.includes('--force')
const api = new docusign.ApiClient()
api.setOAuthBasePath(env.DOCUSIGN_AUTH_SERVER || 'account-d.docusign.com')
const key = Buffer.from(env.DOCUSIGN_PRIVATE_KEY.replace(/\\n/g, '\n'))
const tok = await api.requestJWTUserToken(env.DOCUSIGN_INTEGRATION_KEY, env.DOCUSIGN_USER_ID, ['signature', 'impersonation'], key, 3600)
api.setBasePath(env.DOCUSIGN_BASE_PATH || 'https://demo.docusign.net/restapi')
api.addDefaultHeader('Authorization', `Bearer ${tok.body.access_token}`)

const BRAND_ID = 'd892d79e-b9b2-4a4c-9349-dd9d30044ac5' // pt_BR
const pdfPF = fs.readFileSync(path.join(root, 'docs/demos/assets/doc-gen/Proposta_Adesao_PF_esign.pdf'))
const pdfPJ = fs.readFileSync(path.join(root, 'docs/demos/assets/doc-gen/Proposta_Adesao_PJ_esign.pdf'))

// Campos de dados: pré-preenchidos pelo workflow, somente leitura para o signatário (locked, não obrigatórios).
const text = (label, width = '140') => ({
  tabLabel: label,
  anchorString: `{{${label}}}`,
  anchorUnits: 'pixels',
  anchorXOffset: '0',
  anchorYOffset: '-4',
  anchorIgnoreIfNotPresent: 'true',
  width,
  height: '14',
  font: 'helvetica',
  fontSize: 'size9',
  required: 'false',
  locked: 'true',
})

const signHere = (label, anchor) => ({
  tabLabel: label, anchorString: anchor, anchorUnits: 'pixels',
  anchorXOffset: '-200', anchorYOffset: '-20', anchorIgnoreIfNotPresent: 'true',
})

const PF_FIELDS = [
  ['NumeroProposta', '120'], ['DataProposta', '90'], ['NomeTitular', '220'], ['CpfTitular', '110'],
  ['EmailTitular', '220'], ['CelularTitular', '110'], ['DataNascimento', '90'], ['Endereco', '260'],
  ['Produto', '160'], ['ValorContribuicao', '100'], ['Periodicidade', '90'], ['Canal', '110'],
  ['Corretor', '140'], ['Beneficiarios', '260'],
]
const PJ_FIELDS = [
  ['NumeroProposta', '120'], ['DataProposta', '90'], ['RazaoSocial', '220'], ['Cnpj', '120'],
  ['Produto', '160'], ['ValorContribuicao', '100'], ['Periodicidade', '90'], ['Canal', '110'],
  ...[1, 2, 3].flatMap((i) => [[`Rep${i}Nome`, '150'], [`Rep${i}Cpf`, '90'], [`Rep${i}Cargo`, '110']]),
  ['Test1Nome', '150'], ['Test2Nome', '150'],
]

const cc = (id, order) => ({ roleName: 'Corretor', recipientId: String(id), routingOrder: String(order) })

const templates = [
  {
    name: 'Fontara Seguros - Proposta de Adesao PF',
    description: 'Proposta de Adesão PF (demo): dados pré-preenchidos pelo Workflow Builder, assinatura do Titular, cópia ao Corretor.',
    emailSubject: 'Fontara Seguros - Proposta de Adesão para assinatura',
    brandId: BRAND_ID,
    shared: 'false',
    status: 'created',
    documents: [{ documentId: '1', name: 'Proposta de Adesão PF', fileExtension: 'pdf', documentBase64: pdfPF.toString('base64') }],
    recipients: {
      signers: [{
        roleName: 'Titular', recipientId: '1', routingOrder: '1',
        tabs: {
          textTabs: PF_FIELDS.map(([l, w]) => text(l, w)),
          dateSignedTabs: [{ tabLabel: 'DataTitular', anchorString: '/data_titular/', anchorUnits: 'pixels', anchorYOffset: '-4', anchorIgnoreIfNotPresent: 'true' }],
          signHereTabs: [signHere('AssinaturaTitular', '/assinatura_titular/')],
        },
      }],
      carbonCopies: [cc(2, 2)],
    },
  },
  {
    name: 'Fontara Seguros - Proposta de Adesao PJ',
    description: 'Proposta de Adesão PJ (demo): 1 a 3 representantes (ordem 1), 0 a 2 testemunhas (ordem 2), cópia ao Corretor.',
    emailSubject: 'Fontara Seguros - Proposta de Adesão para assinatura',
    brandId: BRAND_ID,
    shared: 'false',
    status: 'created',
    documents: [{ documentId: '1', name: 'Proposta de Adesão PJ', fileExtension: 'pdf', documentBase64: pdfPJ.toString('base64') }],
    recipients: {
      // Roteamento variável: no envio, o workflow deixa nome/e-mail em branco nos papéis não usados
      // (ex.: Representante 3, Testemunhas) e o DocuSign simplesmente os omite do envelope,
      // permitindo 1..3 representantes e 0..2 testemunhas com o mesmo template.
      signers: [
        { roleName: 'Representante 1', recipientId: '1', routingOrder: '1',
          tabs: { textTabs: PJ_FIELDS.map(([l, w]) => text(l, w)), signHereTabs: [signHere('AssinaturaRep1', '/assinatura_rep1/')] } },
        { roleName: 'Representante 2', recipientId: '2', routingOrder: '1', tabs: { signHereTabs: [signHere('AssinaturaRep2', '/assinatura_rep2/')] } },
        { roleName: 'Representante 3', recipientId: '3', routingOrder: '1', tabs: { signHereTabs: [signHere('AssinaturaRep3', '/assinatura_rep3/')] } },
        { roleName: 'Testemunha 1', recipientId: '4', routingOrder: '2', tabs: { signHereTabs: [signHere('AssinaturaTest1', '/assinatura_test1/')] } },
        { roleName: 'Testemunha 2', recipientId: '5', routingOrder: '2', tabs: { signHereTabs: [signHere('AssinaturaTest2', '/assinatura_test2/')] } },
      ],
      carbonCopies: [cc(6, 3)],
    },
  },
]

const templatesApi = new docusign.TemplatesApi(api)
const results = []
for (const t of templates) {
  let id
  if (!force) {
    const list = await templatesApi.listTemplates(env.DOCUSIGN_ACCOUNT_ID, { searchText: t.name })
    const found = (list.envelopeTemplates || []).find((x) => x.name === t.name)
    if (found) { id = found.templateId; console.log(`já existe: ${t.name} -> ${id} (use --force para criar outro)`) }
  }
  if (!id) {
    const res = await templatesApi.createTemplate(env.DOCUSIGN_ACCOUNT_ID, { envelopeTemplate: t })
    id = res.templateId
    console.log(`criado: ${t.name} -> ${id}`)
  }
  results.push({ name: t.name, id })
}

// Verificação: papéis e contagem de tabs por papel.
for (const { name, id } of results) {
  const tpl = await templatesApi.get(env.DOCUSIGN_ACCOUNT_ID, id, { include: 'recipients,tabs' })
  console.log(`\n${name} (${id})`)
  for (const group of ['signers', 'carbonCopies']) {
    for (const r of tpl.recipients?.[group] || []) {
      const n = Object.values(r.tabs || {}).reduce((a, v) => a + (Array.isArray(v) ? v.length : 0), 0)
      const kinds = Object.entries(r.tabs || {}).map(([k, v]) => `${k}:${v.length}`).join(' ')
      console.log(`  ${r.roleName} (ordem ${r.routingOrder}, ${group}) tabs=${n} ${kinds}`)
    }
  }
}
