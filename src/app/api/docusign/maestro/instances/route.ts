import { NextRequest, NextResponse } from 'next/server'
import type { InstanceSummary, InstancesResponse } from '@/types/demo'
import { JOURNEYS, getJourney } from '@/lib/journeys'
import { isConfigured, routeErrorResponse } from '@/lib/docusign/auth'
import { listInstances } from '@/lib/docusign/maestro'
import { demoInstances } from '@/lib/docusign/demo-data'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const workflowIdParam = sp.get('workflowId') || ''
  const journeySlug = sp.get('journey') || ''

  // Lista de [workflowId, nome] a consultar.
  const targets: [string, string | undefined][] = []
  if (workflowIdParam) {
    targets.push([workflowIdParam, undefined])
  } else if (journeySlug) {
    const j = getJourney(journeySlug)
    if (!j) return NextResponse.json<InstancesResponse>({ instances: [], error: `Jornada desconhecida: ${journeySlug}` }, { status: 400 })
    for (const id of [j.workflowId, j.embeddedWorkflowId]) if (id) targets.push([id, j.title])
  } else {
    const seen = new Set<string>()
    for (const j of JOURNEYS) {
      for (const id of [j.workflowId, j.embeddedWorkflowId]) {
        if (id && !seen.has(id)) { seen.add(id); targets.push([id, j.title]) }
      }
    }
  }

  if (!isConfigured() || targets.length === 0) {
    return NextResponse.json<InstancesResponse>({ instances: demoInstances(workflowIdParam || undefined), demo: true })
  }

  try {
    const results = await Promise.allSettled(targets.map(([id, name]) => listInstances(id, name)))
    const instances: InstanceSummary[] = []
    const errors: unknown[] = []
    for (const r of results) {
      if (r.status === 'fulfilled') instances.push(...r.value)
      else errors.push(r.reason)
    }
    if (errors.length === results.length) throw errors[0]
    instances.sort((a, b) => (b.startedAt || '').localeCompare(a.startedAt || ''))
    return NextResponse.json<InstancesResponse>({ instances })
  } catch (err) {
    return routeErrorResponse(err, 'maestro-instances', { instances: [] })
  }
}
