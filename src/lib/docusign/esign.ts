// eSignature REST API: envelopes, recipient view (incl. Focused View).
import type { EnvelopeSummary } from '@/types/demo'
import { dsFetch, env, getEsignApiClient } from './auth'


export const DOCUSIGN_JS_ORIGIN_DEMO = 'https://apps-d.docusign.com'

export interface RecipientViewInput {
  name: string
  email: string
  clientUserId: string
  returnUrl: string
  recipientId?: string
  frameAncestors?: string[] // Focused View: origem do app host + https://apps-d.docusign.com
  messageOrigins?: string[] // Focused View: ['https://apps-d.docusign.com']
}

export async function createRecipientView(envelopeId: string, input: RecipientViewInput): Promise<string> {
  const { apiClient, accountId, docusign } = await getEsignApiClient()
  const envelopesApi = new docusign.EnvelopesApi(apiClient)

  const viewRequest: Record<string, unknown> = {
    returnUrl: input.returnUrl,
    authenticationMethod: 'none',
    email: input.email,
    userName: input.name,
    clientUserId: input.clientUserId,
  }
  if (input.recipientId) viewRequest.recipientId = input.recipientId
  if (input.frameAncestors?.length) {
    viewRequest.frameAncestors = input.frameAncestors
    viewRequest.messageOrigins = input.messageOrigins?.length ? input.messageOrigins : [DOCUSIGN_JS_ORIGIN_DEMO]
  }

  const result = await envelopesApi.createRecipientView(accountId, envelopeId, {
    recipientViewRequest: docusign.RecipientViewRequest.constructFromObject(viewRequest),
  })
  return result.url
}

function toRecipients(env: any): EnvelopeSummary['recipients'] {
  const r = env?.recipients
  if (!r) return undefined
  const out: NonNullable<EnvelopeSummary['recipients']> = []
  const groups: [string, string][] = [
    ['signers', 'Signatário'],
    ['carbonCopies', 'Cópia'],
    ['certifiedDeliveries', 'Entrega certificada'],
    ['inPersonSigners', 'Presencial'],
    ['agents', 'Agente'],
    ['editors', 'Editor'],
    ['intermediaries', 'Intermediário'],
    ['witnesses', 'Testemunha'],
    ['notaries', 'Tabelião'],
  ]
  for (const [key, label] of groups) {
    for (const rec of r[key] || []) {
      out.push({
        name: rec.name || rec.signerName || '',
        email: rec.email || rec.signerEmail || '',
        role: rec.roleName || label,
        status: rec.status || '',
      })
    }
  }
  return out
}

export async function listEnvelopes(days = 7): Promise<EnvelopeSummary[]> {
  const from = new Date(Date.now() - Math.max(1, days) * 86400000).toISOString()
  const res: any = await dsFetch(env.basePath, `/v2.1/accounts/${env.accountId}/envelopes`, {
    query: {
      from_date: from,
      include: 'recipients',
      order_by: 'last_modified',
      order: 'desc',
      count: 100,
    },
  })
  const list: any[] = res?.envelopes || []
  return list.map((e) => ({
    envelopeId: e.envelopeId,
    subject: e.emailSubject || '(sem assunto)',
    status: e.status,
    sentAt: e.sentDateTime || e.createdDateTime || undefined,
    completedAt: e.completedDateTime || undefined,
    recipients: toRecipients(e),
  }))
}

// ---------- Proposta HTML (formulário de cotação) ----------

export interface ProposalData {
  signerName: string
  signerEmail: string
  cpf: string
  phone: string
  tipoSeguro: string
  valorCobertura?: string
  observacoes?: string
}

export const TIPO_LABELS: Record<string, string> = {
  vida: 'Seguro de Vida',
  auto: 'Seguro Auto',
  residencial: 'Seguro Residencial',
  empresarial: 'Seguro Empresarial',
  saude: 'Seguro Saúde',
  viagem: 'Seguro Viagem',
  previdencia: 'Previdência Privada',
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function buildPropostaHtml(data: ProposalData): string {
  const hoje = new Date().toLocaleDateString('pt-BR')
  const tipoLabel = escapeHtml(TIPO_LABELS[data.tipoSeguro] || data.tipoSeguro)
  const name = escapeHtml(data.signerName)

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; color: #1a1a2e; margin: 0; padding: 40px; }
    .header { background: #0f2044; color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 8px 0 0; opacity: 0.7; font-size: 14px; }
    .section { margin-bottom: 24px; }
    .section h2 { color: #0f2044; font-size: 18px; border-bottom: 2px solid #e8f0fe; padding-bottom: 8px; }
    .field { display: flex; margin-bottom: 8px; }
    .field label { font-weight: bold; width: 200px; color: #555; font-size: 14px; }
    .field span { font-size: 14px; }
    .highlight { background: #e8f0fe; border-left: 4px solid #2563eb; padding: 16px 20px; border-radius: 4px; margin: 20px 0; }
    .signature-area { margin-top: 60px; border-top: 1px solid #ccc; padding-top: 30px; }
    .sig-line { border-bottom: 1px solid #333; height: 40px; margin-bottom: 8px; }
    .footer { margin-top: 40px; font-size: 11px; color: #999; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Fontara Seguros</h1>
    <p>Proposta Comercial · ${hoje}</p>
  </div>
  <div class="section">
    <h2>Dados do Solicitante</h2>
    <div class="field"><label>Nome:</label><span>${name}</span></div>
    <div class="field"><label>E-mail:</label><span>${escapeHtml(data.signerEmail)}</span></div>
    <div class="field"><label>CPF:</label><span>${escapeHtml(data.cpf)}</span></div>
    <div class="field"><label>Telefone:</label><span>${escapeHtml(data.phone)}</span></div>
  </div>
  <div class="section">
    <h2>Produto Solicitado</h2>
    <div class="field"><label>Tipo de Seguro:</label><span>${tipoLabel}</span></div>
    ${data.valorCobertura ? `<div class="field"><label>Cobertura desejada:</label><span>${escapeHtml(data.valorCobertura)}</span></div>` : ''}
    ${data.observacoes ? `<div class="field"><label>Observações:</label><span>${escapeHtml(data.observacoes)}</span></div>` : ''}
  </div>
  <div class="highlight">
    <strong>Próximos passos:</strong> Nossa equipe entrará em contato em até 24 horas com as melhores
    opções de cobertura disponíveis para o seu perfil.
  </div>
  <div class="signature-area">
    <p><strong>Concordo com os termos desta proposta e autorizo a análise do meu perfil de risco.</strong></p>
    <br/>
    <div class="sig-line"></div>
    <p style="font-size:12px;color:#555;">Assinatura do Solicitante — ${name}</p>
    <p style="font-size:12px;color:#555;">Data: ___/___/______</p>
  </div>
  <div class="footer">Fontara Seguros · Av. Paulista, 1000 — São Paulo, SP · CNPJ 00.000.000/0001-00</div>
</body>
</html>`
}

export interface CreatedEnvelope {
  envelopeId: string
  status: string
  clientUserId?: string
}

// embedded=true => signer recebe clientUserId (obrigatório para createRecipientView / Focused View).
export async function createProposalEnvelope(
  data: ProposalData,
  opts: { embedded?: boolean; clientUserId?: string } = {}
): Promise<CreatedEnvelope> {
  const { apiClient, accountId, docusign } = await getEsignApiClient()
  const envelopesApi = new docusign.EnvelopesApi(apiClient)
  const clientUserId = opts.embedded ? opts.clientUserId || data.signerEmail.toLowerCase() : undefined

  const signer = docusign.Signer.constructFromObject({
    email: data.signerEmail,
    name: data.signerName,
    recipientId: '1',
    routingOrder: '1',
    ...(clientUserId ? { clientUserId } : {}),
    tabs: docusign.Tabs.constructFromObject({
      signHereTabs: [
        docusign.SignHere.constructFromObject({
          anchorString: 'Assinatura do Solicitante',
          anchorYOffset: '10',
          anchorUnits: 'pixels',
          anchorXOffset: '0',
        }),
      ],
    }),
  })

  const envelopeDefinition = docusign.EnvelopeDefinition.constructFromObject({
    emailSubject: `Fontara Seguros — Proposta de ${TIPO_LABELS[data.tipoSeguro] || data.tipoSeguro}`.slice(0, 100),
    documents: [
      docusign.Document.constructFromObject({
        documentBase64: Buffer.from(buildPropostaHtml(data)).toString('base64'),
        name: 'Proposta Fontara Seguros',
        fileExtension: 'html',
        documentId: '1',
      }),
    ],
    recipients: docusign.Recipients.constructFromObject({ signers: [signer] }),
    status: 'sent',
  })

  const result = await envelopesApi.createEnvelope(accountId, { envelopeDefinition })
  return { envelopeId: result.envelopeId, status: result.status, clientUserId }
}

// ---------- Contratação com entrega por WhatsApp ----------
// deliveryMethod 'WhatsApp' só é respeitado em compositeTemplates (inlineTemplates.recipients);
// em templateRoles o DocuSign ignora e volta para e-mail. WhatsApp não combina com e-mail no mesmo signatário.

export const PROPOSTA_PF_TEMPLATE_ID = '8e999bc2-0e93-4917-84b3-315fc0ae97f9'

export interface WhatsAppProposalInput {
  name: string
  phone: string // qualquer formato; normalizado para DDD + número
  ccEmail?: string // cópia (papel Corretor) por e-mail
  fields: Record<string, string> // tabLabel -> valor (campos do template PF)
}

// "(11) 99999-9999" | "+55 11 99999-9999" -> { countryCode: '55', number: '11999999999' }
export function toBrPhone(raw: string): { countryCode: string; number: string } {
  let d = String(raw || '').replace(/\D/g, '')
  if (d.length > 11 && d.startsWith('55')) d = d.slice(2)
  return { countryCode: '55', number: d }
}

export async function createWhatsAppProposal(input: WhatsAppProposalInput): Promise<CreatedEnvelope> {
  const phoneNumber = toBrPhone(input.phone)
  const textTabs = Object.entries(input.fields)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([tabLabel, value]) => ({ tabLabel, value: String(value) }))

  const recipients: Record<string, unknown> = {
    signers: [{
      recipientId: '1',
      roleName: 'Titular',
      routingOrder: '1',
      name: input.name,
      deliveryMethod: 'WhatsApp',
      phoneNumber,
      tabs: { textTabs },
    }],
  }
  if (input.ccEmail) {
    recipients.carbonCopies = [{ recipientId: '2', roleName: 'Corretor', routingOrder: '2', name: 'Central Fontara Seguros', email: input.ccEmail }]
  }

  const res: any = await dsFetch(env.basePath, `/v2.1/accounts/${env.accountId}/envelopes`, {
    method: 'POST',
    body: {
      status: 'sent',
      emailSubject: 'Fontara Seguros - Proposta de Adesão para assinatura',
      compositeTemplates: [{
        compositeTemplateId: '1',
        serverTemplates: [{ sequence: '1', templateId: PROPOSTA_PF_TEMPLATE_ID }],
        inlineTemplates: [{ sequence: '2', recipients }],
      }],
    },
  })
  return { envelopeId: res.envelopeId, status: res.status }
}

export interface WhatsAppStatus {
  envelopeId: string
  status: string // sent | delivered | completed | declined | voided
  signerStatus?: string
  deliveredAt?: string
  signedAt?: string
  completedAt?: string
}

export async function getWhatsAppStatus(envelopeId: string): Promise<WhatsAppStatus> {
  const e: any = await dsFetch(env.basePath, `/v2.1/accounts/${env.accountId}/envelopes/${encodeURIComponent(envelopeId)}`, {
    query: { include: 'recipients' },
  })
  const s = e?.recipients?.signers?.[0]
  return {
    envelopeId,
    status: e?.status,
    signerStatus: s?.status,
    deliveredAt: s?.deliveredDateTime,
    signedAt: s?.signedDateTime,
    completedAt: e?.completedDateTime,
  }
}
