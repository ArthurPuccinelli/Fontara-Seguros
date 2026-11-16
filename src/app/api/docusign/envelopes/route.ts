import { NextRequest, NextResponse } from 'next/server'
import type { EnvelopesResponse } from '@/types/demo'
import { isConfigured, routeErrorResponse } from '@/lib/docusign/auth'
import { listEnvelopes } from '@/lib/docusign/esign'
import { demoEnvelopes } from '@/lib/docusign/demo-data'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const days = Math.min(90, Math.max(1, Number(req.nextUrl.searchParams.get('days')) || 7))
  if (!isConfigured()) return NextResponse.json<EnvelopesResponse>({ envelopes: demoEnvelopes(), demo: true })
  try {
    return NextResponse.json<EnvelopesResponse>({ envelopes: await listEnvelopes(days) })
  } catch (err) {
    return routeErrorResponse(err, 'envelopes', { envelopes: [] })
  }
}
