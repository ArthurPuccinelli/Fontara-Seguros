import { NextRequest, NextResponse } from 'next/server'
import type { WebFormInstanceRequest, WebFormInstanceResponse } from '@/types/demo'
import { getJourney } from '@/lib/journeys'
import { isConfigured, routeErrorResponse } from '@/lib/docusign/auth'
import { createInstance } from '@/lib/docusign/webforms'
import { DEMO_MESSAGE, demoInstanceId } from '@/lib/docusign/demo-data'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<WebFormInstanceRequest>
  if (!body.clientUserId) {
    return NextResponse.json<WebFormInstanceResponse>({ error: 'clientUserId é obrigatório' }, { status: 400 })
  }
  const journey = body.journey ? getJourney(body.journey) : undefined
  if (body.journey && !journey) {
    return NextResponse.json<WebFormInstanceResponse>({ error: `Jornada desconhecida: ${body.journey}` }, { status: 400 })
  }
  const formId = body.formId || journey?.formId || ''

  if (!isConfigured() || !formId) {
    return NextResponse.json<WebFormInstanceResponse>({ demo: true, instanceId: demoInstanceId(), message: DEMO_MESSAGE })
  }

  try {
    const r = await createInstance(formId, {
      clientUserId: body.clientUserId,
      formValues: body.formValues,
      returnUrl: body.returnUrl,
    })
    return NextResponse.json<WebFormInstanceResponse>({ instanceId: r.instanceId, instanceUrl: r.instanceUrl, instanceToken: r.instanceToken })
  } catch (err) {
    return routeErrorResponse(err, 'webforms')
  }
}
