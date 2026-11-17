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

// ---------- Proposta de seguro (cotação do site) — Doc Gen ----------
// Template "Fontara Seguros - Proposta de Seguro (Cotacao)" (scripts/create-cotacao-template.mjs):
// .docx com {{Campos}} de remetente. Fluxo: rascunho a partir do template -> docGenFormFields -> envio.

export const COTACAO_TEMPLATE_ID = 'fe5d08f8-ae51-40db-9b08-f1a69ad36351'

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

interface ProdutoCotacao {
  nome: string
  descricao: string
  capitalPadrao: number
  taxa: number // prêmio líquido anual = capital × taxa (mínimo premioMinimo)
  premioMinimo: number
  vigencia: string
  // [nome, fração do capital (null = texto fixo), franquia/carência]
  coberturas: [string, number | string, string][]
}

// Valores ilustrativos para a demo; não representam tarifa real.
const PRODUTOS: Record<string, ProdutoCotacao> = {
  vida: {
    nome: 'Fontara Vida Família', descricao: 'Seguro de vida individual com proteção para a família e assistência funeral.',
    capitalPadrao: 300000, taxa: 0.0026, premioMinimo: 360, vigencia: '12 meses, renovação automática',
    coberturas: [['Morte por qualquer causa', 1, 'Carência de 24 meses para suicídio'], ['Invalidez permanente total ou parcial por acidente', 1, 'Não há'],
      ['Doenças graves (diagnóstico)', 0.25, 'Carência de 90 dias'], ['Assistência funeral familiar', 'Até R$ 10.000,00', 'Não há']],
  },
  auto: {
    nome: 'Fontara Auto Completo', descricao: 'Cobertura compreensiva para o veículo, terceiros e assistência 24 horas.',
    capitalPadrao: 90000, taxa: 0.042, premioMinimo: 1800, vigencia: '12 meses',
    coberturas: [['Colisão, incêndio e roubo/furto (100% FIPE)', 1, 'R$ 3.200,00 (obrigatória)'], ['Danos materiais a terceiros', 'R$ 200.000,00', 'Não há'],
      ['Danos corporais a terceiros', 'R$ 200.000,00', 'Não há'], ['Assistência 24h e carro reserva (15 dias)', 'Incluso', 'Não há']],
  },
  residencial: {
    nome: 'Fontara Casa Protegida', descricao: 'Proteção do imóvel e dos bens contra incêndio, roubo e danos elétricos.',
    capitalPadrao: 600000, taxa: 0.0011, premioMinimo: 280, vigencia: '12 meses',
    coberturas: [['Incêndio, queda de raio e explosão', 1, 'Não há'], ['Roubo ou furto qualificado de bens', 0.1, '10% dos prejuízos, mín. R$ 500,00'],
      ['Danos elétricos', 0.05, 'R$ 300,00'], ['Responsabilidade civil familiar', 0.05, 'Não há']],
  },
  empresarial: {
    nome: 'Fontara Empresa Segura', descricao: 'Patrimônio e continuidade do negócio para pequenas e médias empresas.',
    capitalPadrao: 1500000, taxa: 0.0035, premioMinimo: 1500, vigencia: '12 meses',
    coberturas: [['Incêndio, raio e explosão (prédio e conteúdo)', 1, 'R$ 5.000,00'], ['Lucros cessantes (6 meses)', 0.2, '5 dias úteis'],
      ['Roubo de bens e valores', 0.05, '10% dos prejuízos'], ['Responsabilidade civil operações', 0.1, 'R$ 2.000,00']],
  },
  saude: {
    nome: 'Fontara Saúde Essencial', descricao: 'Reembolso de despesas médico-hospitalares com rede referenciada nacional.',
    capitalPadrao: 500000, taxa: 0.0144, premioMinimo: 4800, vigencia: '12 meses, reajuste anual',
    coberturas: [['Internação hospitalar e UTI', 1, 'Carência de 180 dias'], ['Consultas e exames', 'Ilimitado na rede', 'Carência de 30 dias'],
      ['Urgência e emergência', 'Incluso', 'Carência de 24 horas'], ['Reembolso fora da rede', 'Até 2x a tabela', 'Não há']],
  },
  viagem: {
    nome: 'Fontara Viagem Internacional', descricao: 'Assistência médica, bagagem e cancelamento para viagens ao exterior.',
    capitalPadrao: 300000, taxa: 0.0012, premioMinimo: 189, vigencia: 'Período da viagem (até 30 dias)',
    coberturas: [['Despesas médicas e hospitalares', 1, 'Não há'], ['Extravio de bagagem', 0.02, 'Não há'],
      ['Cancelamento de viagem', 0.05, 'Não há'], ['Regresso sanitário', 'Incluso', 'Não há']],
  },
}

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const dataBR = (d: Date) => d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })

// "R$ 500.000" | "500000" | "500.000,00" -> 500000 (0 se vazio)
function parseValor(v?: string): number {
  if (!v) return 0
  const n = Number(v.replace(/[^\d,]/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

// Campos de remetente do .docx (nomes iguais aos {{Campos}} do modelo)
export function buildCotacaoFields(data: ProposalData, now = new Date()): Record<string, string> {
  const prod = PRODUTOS[data.tipoSeguro] || PRODUTOS.vida
  const capital = parseValor(data.valorCobertura) || prod.capitalPadrao
  const liquido = Math.max(prod.premioMinimo, Math.round(capital * prod.taxa * 100) / 100)
  const iof = Math.round(liquido * 0.0738 * 100) / 100
  const total = liquido + iof
  const validade = new Date(now.getTime() + 30 * 86400000)

  const fields: Record<string, string> = {
    NumeroProposta: `FS-${now.getFullYear()}-${String(now.getTime()).slice(-6)}`,
    DataEmissao: dataBR(now),
    ValidadeProposta: dataBR(validade),
    NomeProponente: data.signerName,
    CpfProponente: data.cpf || '—',
    EmailProponente: data.signerEmail,
    CelularProponente: data.phone || '—',
    Produto: prod.nome,
    DescricaoProduto: prod.descricao,
    Vigencia: prod.vigencia,
    CapitalReferencia: brl(capital),
    PremioLiquido: brl(liquido),
    Iof: brl(iof),
    PremioTotal: brl(total),
    FormaPagamento: `12x de ${brl(total / 12)} sem juros`,
    Observacoes: data.observacoes?.trim() || 'Nenhuma observação informada.',
  }
  prod.coberturas.forEach(([nome, cap, franquia], i) => {
    fields[`Cob${i + 1}Nome`] = nome
    fields[`Cob${i + 1}Capital`] = typeof cap === 'number' ? brl(capital * cap) : cap
    fields[`Cob${i + 1}Franquia`] = franquia
  })
  return fields
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
  const clientUserId = opts.embedded ? opts.clientUserId || data.signerEmail.toLowerCase() : undefined
  const base = `/v2.1/accounts/${env.accountId}/envelopes`

  // 1) Rascunho a partir do template Doc Gen
  const draft: any = await dsFetch(env.basePath, base, {
    method: 'POST',
    body: {
      status: 'created',
      templateId: COTACAO_TEMPLATE_ID,
      emailSubject: `Fontara Seguros — Proposta de ${TIPO_LABELS[data.tipoSeguro] || 'Seguro'}`.slice(0, 100),
      templateRoles: [{ roleName: 'Proponente', name: data.signerName, email: data.signerEmail, ...(clientUserId ? { clientUserId } : {}) }],
    },
  })
  const envelopeId: string = draft.envelopeId

  // 2) Campos de remetente: o documentId do Doc Gen vem do GET (é um GUID, não "1")
  const form: any = await dsFetch(env.basePath, `${base}/${envelopeId}/docGenFormFields`)
  const documentId = form?.docGenFormFields?.[0]?.documentId
  if (!documentId) throw new Error('Template da cotação sem campos Doc Gen (docGenFormFields vazio).')
  const values = buildCotacaoFields(data)
  await dsFetch(env.basePath, `${base}/${envelopeId}/docGenFormFields`, {
    method: 'PUT',
    body: { docGenFormFields: [{ documentId, docGenFormFieldList: Object.entries(values).map(([name, value]) => ({ name, value })) }] },
  })

  // 3) Envio
  await dsFetch(env.basePath, `${base}/${envelopeId}`, { method: 'PUT', body: { status: 'sent' } })
  return { envelopeId, status: 'sent', clientUserId }
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
