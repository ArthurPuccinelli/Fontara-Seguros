import { NextRequest, NextResponse } from 'next/server'
import type { MaestroTriggerRequest, MaestroTriggerResponse, TriggerInputValue } from '@/types/demo'
import { getJourney } from '@/lib/journeys'
import { env, isConfigured, routeErrorResponse } from '@/lib/docusign/auth'
import { triggerWorkflow } from '@/lib/docusign/maestro'
import { DEMO_MESSAGE, demoInstanceId } from '@/lib/docusign/demo-data'

export const dynamic = 'force-dynamic'

const RESERVED = new Set(['workflowId', 'journey', 'inputs', 'mode'])

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as MaestroTriggerRequest & Record<string, unknown>

  // Compatibilidade: chaves extras no topo do body são tratadas como inputs.
  const inputs: Record<string, TriggerInputValue> = {}
  for (const [k, v] of Object.entries(body)) {
    if (!RESERVED.has(k) && ['string', 'number', 'boolean'].includes(typeof v)) inputs[k] = v as TriggerInputValue
  }
  Object.assign(inputs, body.inputs || {})

  const journey = body.journey ? getJourney(body.journey) : undefined
  if (body.journey && !journey) {
    return NextResponse.json<MaestroTriggerResponse>({ error: `Jornada desconhecida: ${body.journey}` }, { status: 400 })
  }

  let workflowId = body.workflowId
  if (!workflowId && journey) {
    workflowId = body.mode === 'embedded-workflow'
      ? journey.embeddedWorkflowId || journey.workflowId
      : journey.workflowId || journey.embeddedWorkflowId
  }
  if (!workflowId && !journey) workflowId = env.defaultWorkflowId

  if (!isConfigured() || !workflowId) {
    return NextResponse.json<MaestroTriggerResponse>({ demo: true, instanceId: demoInstanceId(), message: DEMO_MESSAGE })
  }

  try {
    const name = `Fontara Seguros${journey ? ` - ${journey.title}` : ''} - ${new Date().toISOString()}`
    const result = await triggerWorkflow(workflowId, inputs, name)
    return NextResponse.json<MaestroTriggerResponse>({ instanceId: result.instanceId, embeddedUrl: result.embeddedUrl })
  } catch (err) {
    return routeErrorResponse(err, 'maestro')
  }
}
