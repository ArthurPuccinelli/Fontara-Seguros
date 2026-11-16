// Maestro / Workflow Builder API (aow_manage).
import type { InstanceSummary, TriggerInputValue } from '@/types/demo'
import { dsFetch, env } from './auth'


const acct = () => `/accounts/${env.accountId}`

export async function listWorkflows(): Promise<any> {
  return dsFetch(env.maestroBaseUrl, `${acct()}/workflows`)
}

export async function getTriggerRequirements(workflowId: string): Promise<any> {
  return dsFetch(env.maestroBaseUrl, `${acct()}/workflows/${workflowId}/trigger-requirements`)
}

// Monta trigger_inputs a partir do trigger_input_schema: casa nomes sem diferenciar maiúsculas,
// e preenche defaults por tipo para campos não informados.
export function buildTriggerInputs(
  schema: unknown,
  provided: Record<string, TriggerInputValue>
): Record<string, TriggerInputValue> {
  const out: Record<string, TriggerInputValue> = {}
  if (!Array.isArray(schema)) return { ...provided }
  for (const field of schema) {
    const name: string = field?.field_name
    if (!name) continue
    const type = String(field?.field_data_type || '').toLowerCase()
    if (provided[name] !== undefined) {
      out[name] = provided[name]
      continue
    }
    const key = Object.keys(provided).find((k) => k.toLowerCase() === name.toLowerCase())
    if (key) {
      out[name] = provided[key]
      continue
    }
    switch (type) {
      case 'date': out[name] = new Date().toISOString().split('T')[0]; break
      case 'number': case 'integer': case 'decimal': out[name] = 0; break
      case 'boolean': out[name] = false; break
      default: out[name] = ''
    }
  }
  return out
}

export interface TriggerResult {
  instanceId: string
  embeddedUrl?: string
  raw: any
}

export async function triggerWorkflow(
  workflowId: string,
  inputs: Record<string, TriggerInputValue> = {},
  instanceName = `Fontara Seguros - ${new Date().toISOString()}`
): Promise<TriggerResult> {
  let triggerInputs: Record<string, TriggerInputValue> = inputs
  try {
    const req = await getTriggerRequirements(workflowId)
    triggerInputs = buildTriggerInputs(req?.trigger_input_schema, inputs)
  } catch (err) {
    console.warn('[maestro] trigger-requirements falhou, usando inputs informados:', err instanceof Error ? err.message : err)
  }

  const result = await dsFetch(env.maestroBaseUrl, `${acct()}/workflows/${workflowId}/actions/trigger`, {
    method: 'POST',
    body: {
      instance_name: instanceName,
      trigger_inputs: Object.keys(triggerInputs).length > 0 ? triggerInputs : undefined,
    },
  })

  const instanceId = result?.instance_id ?? result?.instanceId ?? result?.id
  const embeddedUrl = result?.instance_url ?? result?.workflow_instance_url ?? result?.url ?? undefined
  if (!instanceId) throw new Error('O trigger do workflow não retornou instanceId')
  return { instanceId, embeddedUrl, raw: result }
}

function pickArray(res: any): any[] {
  if (Array.isArray(res)) return res
  for (const k of ['data', 'instances', 'workflow_instances', 'items', 'value']) {
    if (Array.isArray(res?.[k])) return res[k]
  }
  return []
}

let loggedUnknownShape = false

export function mapInstance(raw: any, workflowId: string, workflowName?: string): InstanceSummary {
  const known = ['id', 'instance_id', 'name', 'instance_name', 'workflow_status', 'instance_state', 'status',
    'started_at', 'start_date', 'ended_at', 'end_date', 'started_by', 'started_by_name', 'last_completed_step_name']
  if (!loggedUnknownShape && raw && typeof raw === 'object' && !Object.keys(raw).some((k) => known.includes(k))) {
    loggedUnknownShape = true
    console.warn('[maestro] formato de instância desconhecido:', JSON.stringify(raw).slice(0, 500))
  }
  const step = raw?.current_step_name ?? raw?.current_step?.name ?? raw?.last_completed_step_name
  return {
    id: String(raw?.id ?? raw?.instance_id ?? ''),
    name: String(raw?.name ?? raw?.instance_name ?? 'Instância'),
    workflowId: String(raw?.workflow_id ?? raw?.template_id ?? workflowId),
    workflowName: raw?.workflow_name ?? workflowName,
    status: String(raw?.workflow_status ?? raw?.instance_state ?? raw?.status ?? 'Unknown'),
    startedAt: raw?.started_at ?? raw?.start_date ?? raw?.created_at ?? undefined,
    endedAt: raw?.ended_at ?? raw?.end_date ?? raw?.canceled_at ?? undefined,
    currentStep: step
      ? String(step)
      : typeof raw?.last_completed_step === 'number' && typeof raw?.total_steps === 'number'
        ? `Etapa ${raw.last_completed_step}/${raw.total_steps}`
        : undefined,
    startedBy: raw?.started_by_name ?? raw?.started_by ?? undefined,
  }
}

export async function listInstances(workflowId: string, workflowName?: string): Promise<InstanceSummary[]> {
  const res = await dsFetch(env.maestroBaseUrl, `${acct()}/workflows/${workflowId}/instances`)
  return pickArray(res).map((r) => mapInstance(r, workflowId, workflowName))
}

export async function getInstance(workflowId: string, instanceId: string): Promise<InstanceSummary> {
  const res = await dsFetch(env.maestroBaseUrl, `${acct()}/workflows/${workflowId}/instances/${instanceId}`)
  return mapInstance(res?.data ?? res, workflowId)
}
