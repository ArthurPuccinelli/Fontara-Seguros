// Navigator API (Agreements) — GET {NAVIGATOR_BASE}/accounts/{acct}/agreements
// Escopo: adm_store_unified_repo_read. Beta: formato mapeado de forma defensiva.
import type { AgreementSummary } from '@/types/demo'
import { dsFetch, env } from './auth'
import { documentoPorNome, nomePorDocumento, normalizeName } from '@/lib/crm'


export interface ListAgreementsOptions {
  cpfCnpj?: string
  expiringInDays?: number
  q?: string
  limit?: number
}

const digits = (s: unknown) => String(s ?? '').replace(/\D/g, '')

// Normaliza custom_provisions / additional_* (dicionário ou array {name,value}) num único mapa.
function flattenCustom(raw: any): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  const sources = [raw?.custom_provisions, raw?.additional_user_defined_data, raw?.additional_custom_esign_data, raw?.additional_custom_clm_data]
  for (const src of sources) {
    if (!src) continue
    if (Array.isArray(src)) {
      for (const item of src) {
        const k = item?.name ?? item?.key ?? item?.label
        if (k) out[String(k)] = item?.value ?? item?.values
      }
    } else if (typeof src === 'object') {
      Object.assign(out, src)
    }
  }
  return out
}

function findCustom(custom: Record<string, unknown>, pattern: RegExp): string | undefined {
  const key = Object.keys(custom).find((k) => pattern.test(k))
  if (!key) return undefined
  const v = custom[key]
  if (v === null || v === undefined || v === '') return undefined
  return Array.isArray(v) ? v.join(', ') : String(v)
}

function cleanDate(d: unknown): string | undefined {
  if (!d || typeof d !== 'string') return undefined
  if (d.startsWith('0001-01-01')) return undefined // "sem data" no Navigator
  return d.slice(0, 10)
}

export function mapAgreement(raw: any): AgreementSummary & { _searchText: string } {
  const p = raw?.provisions || {}
  const custom = flattenCustom(raw)
  const parties: string[] = (Array.isArray(raw?.parties) ? raw.parties : [])
    .map((x: any) => x?.name_in_agreement || x?.preferred_name || x?.name)
    .filter(Boolean)
  // Sem extração customizada de CPF/CNPJ, completa pelo "CRM" (nome da parte -> documento)
  const cpfCnpj = findCustom(custom, /cpf|cnpj/i) ?? parties.map(documentoPorNome).find(Boolean)
  const produto = findCustom(custom, /produto|product/i)
  const value = typeof p.total_agreement_value === 'number' ? p.total_agreement_value
    : p.total_agreement_value ? Number(p.total_agreement_value) || undefined : undefined
  const title = raw?.title || raw?.file_name || raw?.type || 'Contrato'
  return {
    id: String(raw?.id ?? ''),
    title,
    type: raw?.type,
    status: raw?.status,
    parties,
    cpfCnpj,
    produto,
    effectiveDate: cleanDate(p.effective_date),
    expirationDate: cleanDate(p.expiration_date),
    value,
    source: raw?.source_name,
    _searchText: [title, raw?.file_name, raw?.summary, raw?.type, ...parties, ...Object.values(custom).map(String)].join(' '),
  }
}

function nextToken(res: any): string | undefined {
  return res?.response_metadata?.next_cursor || res?.response_metadata?.ctoken || res?.ctoken || res?.next_ctoken || undefined
}

export function filterAgreements<T extends AgreementSummary & { _searchText?: string }>(
  list: T[],
  opts: ListAgreementsOptions
): T[] {
  let out = list
  const doc = digits(opts.cpfCnpj)
  if (doc) {
    const nome = nomePorDocumento(doc)
    out = out.filter(
      (a) =>
        digits(a.cpfCnpj).includes(doc) ||
        digits(a._searchText ?? `${a.title} ${a.parties.join(' ')}`).includes(doc) ||
        (!!nome && a.parties.some((p) => normalizeName(p) === normalizeName(nome)))
    )
  }
  if (opts.expiringInDays !== undefined && opts.expiringInDays >= 0) {
    const today = new Date().toISOString().slice(0, 10)
    const limit = new Date(Date.now() + opts.expiringInDays * 86400000).toISOString().slice(0, 10)
    out = out.filter((a) => a.expirationDate && a.expirationDate >= today && a.expirationDate <= limit)
  }
  const q = opts.q?.trim().toLowerCase()
  if (q) {
    out = out.filter((a) => (a._searchText ?? `${a.title} ${a.parties.join(' ')} ${a.produto ?? ''}`).toLowerCase().includes(q))
  }
  return out
}

export async function listAgreements(opts: ListAgreementsOptions = {}): Promise<AgreementSummary[]> {
  const pageSize = 100
  const maxPages = 5
  const raws: any[] = []
  let ctoken: string | undefined
  for (let i = 0; i < maxPages; i++) {
    const res: any = await dsFetch(env.navigatorBaseUrl, `/accounts/${env.accountId}/agreements`, {
      query: { limit: pageSize, ctoken },
    })
    const page = Array.isArray(res) ? res : res?.data ?? res?.agreements ?? []
    if (!Array.isArray(page)) {
      console.warn('[navigator] formato de resposta desconhecido:', JSON.stringify(res).slice(0, 500))
      break
    }
    raws.push(...page)
    ctoken = nextToken(res)
    if (!ctoken || page.length === 0) break
  }

  const mapped = filterAgreements(raws.map(mapAgreement), opts)
  mapped.sort((a, b) => (a.expirationDate || '9999').localeCompare(b.expirationDate || '9999'))
  return mapped.slice(0, opts.limit ?? 50).map(({ _searchText, ...a }) => { void _searchText; return a })
}
