// Cria (via eSignature API) o template "Fontara Seguros - Resgate/Portabilidade" usado pelo Web Form.
// Uso: node scripts/create-resgate-template.mjs   (lê credenciais do .env.local)
// Campos posicionados por âncora: os placeholders {{Campo}} estão em branco/6pt no PDF.
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
const api = new docusign.ApiClient()
api.setOAuthBasePath(env.DOCUSIGN_AUTH_SERVER || 'account-d.docusign.com')
const key = Buffer.from(env.DOCUSIGN_PRIVATE_KEY.replace(/\\n/g, '\n'))
const tok = await api.requestJWTUserToken(env.DOCUSIGN_INTEGRATION_KEY, env.DOCUSIGN_USER_ID, ['signature', 'impersonation'], key, 3600)
api.setBasePath(env.DOCUSIGN_BASE_PATH || 'https://demo.docusign.net/restapi')
api.addDefaultHeader('Authorization', `Bearer ${tok.body.access_token}`)

const pdf = fs.readFileSync(path.join(root, 'docs/demos/assets/doc-gen/Solicitacao_Resgate_Portabilidade_esign.pdf'))

const text = (label, opts = {}) => ({
  tabLabel: label,
  anchorString: `{{${label}}}`,
  anchorUnits: 'pixels',
  anchorXOffset: '0',
  anchorYOffset: '-4',
  anchorIgnoreIfNotPresent: 'true',
  width: opts.width || '180',
  height: '14',
  font: 'helvetica',
  fontSize: 'size9',
  required: opts.required === false ? 'false' : 'true',
  locked: 'false',
  ...opts.extra,
})

const template = {
  name: 'Fontara Seguros - Resgate/Portabilidade',
  description: 'Template base do Web Form de Resgate/Portabilidade (demo vida e previdência).',
  emailSubject: 'Fontara Seguros - Solicitação de Resgate/Portabilidade',
  shared: 'false',
  status: 'created',
  documents: [{ documentId: '1', name: 'Solicitação de Resgate e Portabilidade', fileExtension: 'pdf', documentBase64: pdf.toString('base64') }],
  recipients: {
    signers: [{
      roleName: 'Titular',
      recipientId: '1',
      routingOrder: '1',
      tabs: {
        textTabs: [
          text('NomeTitular', { width: '220' }),
          text('CpfTitular', { width: '120' }),
          text('NumeroCertificado', { width: '140' }),
          text('ValorResgate', { required: false, width: '120' }),
          text('EntidadeDestino', { required: false, width: '200' }),
          text('CnpjEntidadeDestino', { required: false, width: '140' }),
          text('Banco', { required: false, width: '120' }),
          text('Agencia', { required: false, width: '70' }),
          text('Conta', { required: false, width: '90' }),
        ],
        listTabs: [{
          tabLabel: 'TipoSolicitacao',
          anchorString: '{{TipoSolicitacao}}',
          anchorUnits: 'pixels', anchorYOffset: '-4', anchorIgnoreIfNotPresent: 'true',
          required: 'true', width: '160',
          listItems: [
            { text: 'Resgate total', value: 'Resgate total' },
            { text: 'Resgate parcial', value: 'Resgate parcial' },
            { text: 'Portabilidade', value: 'Portabilidade' },
          ],
        }],
        dateSignedTabs: [{ tabLabel: 'DataSolicitacao', anchorString: '{{DataSolicitacao}}', anchorUnits: 'pixels', anchorYOffset: '-4', anchorIgnoreIfNotPresent: 'true' }],
        signHereTabs: [{ tabLabel: 'AssinaturaTitular', anchorString: '/assinatura_titular/', anchorUnits: 'pixels', anchorXOffset: '-200', anchorYOffset: '-20', anchorIgnoreIfNotPresent: 'true' }],
      },
    }],
  },
}

const templatesApi = new docusign.TemplatesApi(api)
const res = await templatesApi.createTemplate(env.DOCUSIGN_ACCOUNT_ID, { envelopeTemplate: template })
console.log(JSON.stringify({ templateId: res.templateId, name: res.name }, null, 2))
