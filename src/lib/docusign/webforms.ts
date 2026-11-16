// Web Forms API v1.1 — https://apps-d.docusign.com/api/webforms/v1.1/accounts/{acct}/forms/{formId}/instances
// Escopos: signature + webforms_instance_write (create); webforms_read / webforms_instance_read para leitura.
import { dsFetch, env } from './auth'

export interface CreateWebFormInstanceInput {
  clientUserId: string
  formValues?: Record<string, string | number | boolean | string[]>
  returnUrl?: string
  expirationOffset?: number // horas até a instância expirar
  tags?: string[]
}

export interface CreatedWebFormInstance {
  instanceId: string
  instanceUrl: string
  instanceToken: string
  tokenExpirationDateTime?: string
  status?: string
}

export async function createInstance(formId: string, input: CreateWebFormInstanceInput): Promise<CreatedWebFormInstance> {
  const res: any = await dsFetch(env.webformsBaseUrl, `/accounts/${env.accountId}/forms/${formId}/instances`, {
    method: 'POST',
    body: {
      clientUserId: input.clientUserId,
      formValues: input.formValues && Object.keys(input.formValues).length > 0 ? input.formValues : undefined,
      returnUrl: input.returnUrl || undefined,
      expirationOffset: input.expirationOffset ?? 24,
      tags: input.tags,
    },
  })
  if (!res?.id || !res?.formUrl || !res?.instanceToken) {
    throw new Error(`Resposta inesperada do Web Forms createInstance: ${JSON.stringify(res).slice(0, 500)}`)
  }
  return {
    instanceId: res.id,
    instanceUrl: res.formUrl,
    instanceToken: res.instanceToken,
    tokenExpirationDateTime: res.tokenExpirationDateTime,
    status: res.status,
  }
}

export async function listForms(search?: string): Promise<any> {
  return dsFetch(env.webformsBaseUrl, `/accounts/${env.accountId}/forms`, { query: { search } })
}
