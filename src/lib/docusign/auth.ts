// Autenticação DocuSign (JWT Grant) compartilhada por todas as rotas.
// Token em cache no módulo (por instância serverless), renovado 5 min antes de expirar.

const DEFAULT_SCOPES = [
  'signature',
  'impersonation',
  'aow_manage',
  'webforms_read',
  'webforms_instance_read',
  'webforms_instance_write',
  'adm_store_unified_repo_read',
]

const REFRESH_MARGIN_MS = 5 * 60 * 1000

export const env = {
  get integrationKey() { return process.env.DOCUSIGN_INTEGRATION_KEY || '' },
  get userId() { return process.env.DOCUSIGN_USER_ID || '' },
  get accountId() { return process.env.DOCUSIGN_ACCOUNT_ID || '' },
  get privateKey() { return process.env.DOCUSIGN_PRIVATE_KEY || '' },
  get basePath() { return (process.env.DOCUSIGN_BASE_PATH || 'https://demo.docusign.net/restapi').replace(/\/$/, '') },
  get authServer() { return (process.env.DOCUSIGN_AUTH_SERVER || 'account-d.docusign.com').replace(/^https?:\/\//, '').replace(/\/$/, '') },
  get maestroBaseUrl() { return (process.env.DOCUSIGN_MAESTRO_BASE_URL || 'https://api-d.docusign.com/v1').replace(/\/$/, '') },
  get webformsBaseUrl() { return (process.env.DOCUSIGN_WEBFORMS_BASE_URL || 'https://apps-d.docusign.com/api/webforms/v1.1').replace(/\/$/, '') },
  get navigatorBaseUrl() { return (process.env.DOCUSIGN_NAVIGATOR_BASE_URL || 'https://api-d.docusign.com/v1').replace(/\/$/, '') },
  get defaultWorkflowId() { return process.env.DOCUSIGN_MAESTRO_WORKFLOW_ID || '' },
}

export function getScopes(): string[] {
  const override = process.env.DOCUSIGN_SCOPES?.trim()
  return override ? override.split(/\s+/) : DEFAULT_SCOPES
}

export function isConfigured(): boolean {
  return Boolean(env.integrationKey && env.userId && env.accountId && env.privateKey)
}

export function getConsentUrl(): string {
  const params = new URLSearchParams({
    response_type: 'code',
    scope: getScopes().join(' '),
    client_id: env.integrationKey,
    // Precisa estar cadastrado nos Redirect URIs da integration key (Admin > Aplicativos e chaves)
    redirect_uri: process.env.DOCUSIGN_CONSENT_REDIRECT_URI || 'https://fontaraseguros.netlify.app/',
  })
  return `https://${env.authServer}/oauth/auth?${params.toString().replace(/\+/g, '%20')}`
}

export class ConsentRequiredError extends Error {
  consentUrl: string
  constructor(consentUrl: string) {
    super('Consentimento DocuSign necessário para os escopos solicitados (consent_required).')
    this.name = 'ConsentRequiredError'
    this.consentUrl = consentUrl
  }
}

export function isConsentError(err: unknown): err is ConsentRequiredError {
  return err instanceof ConsentRequiredError || (err as { name?: string })?.name === 'ConsentRequiredError'
}

let cachedToken: { token: string; expiresAt: number } | null = null

function extractAuthError(err: unknown): string {
  // SDK v8 usa axios (response.data); versões antigas usavam superagent (response.body/text).
  const e = err as { response?: { body?: unknown; data?: unknown; text?: string }; message?: string }
  const raw = e?.response?.data ?? e?.response?.body
  const body = (typeof raw === 'string' ? safeJson(raw) : raw) as { error?: string; error_description?: string } | undefined
  if (body?.error) return `${body.error}${body.error_description ? `: ${body.error_description}` : ''}`
  if (e?.response?.text) return e.response.text
  return e?.message || String(err)
}

export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - REFRESH_MARGIN_MS) {
    return cachedToken.token
  }
  if (!isConfigured()) throw new Error('DocuSign não configurado (variáveis de ambiente ausentes).')

  const docusign = await import('docusign-esign')
  const apiClient = new docusign.ApiClient()
  apiClient.setOAuthBasePath(env.authServer)

  const privateKey = Buffer.from(env.privateKey.replace(/\\n/g, '\n'), 'utf8')

  try {
    const result = await apiClient.requestJWTUserToken(
      env.integrationKey,
      env.userId,
      getScopes(),
      privateKey,
      3600
    )
    const token: string = result.body.access_token
    const expiresIn = Number(result.body.expires_in) || 3600
    cachedToken = { token, expiresAt: Date.now() + expiresIn * 1000 }
    return token
  } catch (err) {
    const detail = extractAuthError(err)
    if (/consent_required/i.test(detail)) throw new ConsentRequiredError(getConsentUrl())
    throw new Error(`Falha na autenticação JWT DocuSign: ${detail}`)
  }
}

export async function getEsignApiClient(): Promise<{ apiClient: any; accountId: string; docusign: any }> {
  const token = await getAccessToken()
  const docusign = await import('docusign-esign')
  const apiClient = new docusign.ApiClient()
  apiClient.setBasePath(env.basePath)
  apiClient.addDefaultHeader('Authorization', `Bearer ${token}`)
  return { apiClient, accountId: env.accountId, docusign }
}

export interface DsFetchOptions {
  method?: string
  body?: unknown
  query?: Record<string, string | number | boolean | undefined>
}

// fetch JSON com bearer token. Lança Error com status + corpo da resposta.
export async function dsFetch<T = any>(baseUrl: string, path: string, opts: DsFetchOptions = {}): Promise<T> {
  const token = await getAccessToken()
  const method = opts.method || 'GET'
  let url = `${baseUrl.replace(/\/$/, '')}${path}`
  if (opts.query) {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== '') qs.set(k, String(v))
    }
    const s = qs.toString()
    if (s) url += `${url.includes('?') ? '&' : '?'}${s}`
  }

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  })

  const text = await res.text()
  if (!res.ok) {
    throw new DsHttpError(`DocuSign ${method} ${path} → ${res.status}: ${text.slice(0, 1000)}`, res.status, text)
  }
  if (!text) return {} as T
  try {
    return JSON.parse(text) as T
  } catch {
    return text as unknown as T
  }
}

export class DsHttpError extends Error {
  status: number
  responseText: string
  constructor(message: string, status: number, responseText: string) {
    super(message)
    this.name = 'DsHttpError'
    this.status = status
    this.responseText = responseText
  }
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

// Resposta padrão de erro para rotas: 401 {error, consentUrl} em consent_required, senão 500 {error}.
export function routeErrorResponse(err: unknown, context: string, extra: Record<string, unknown> = {}): Response {
  if (isConsentError(err)) {
    return Response.json({ ...extra, error: err.message, consentUrl: err.consentUrl }, { status: 401 })
  }
  const message = errorMessage(err)
  console.error(`[docusign:${context}]`, message)
  return Response.json({ ...extra, error: message }, { status: 500 })
}

function safeJson(s: string): unknown {
  try { return JSON.parse(s) } catch { return { error: s } }
}
