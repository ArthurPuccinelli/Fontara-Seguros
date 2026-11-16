import { NextRequest, NextResponse } from 'next/server'
import type { AgreementsResponse } from '@/types/demo'
import { isConfigured, routeErrorResponse } from '@/lib/docusign/auth'
import { filterAgreements, listAgreements } from '@/lib/docusign/navigator'
import { demoAgreements } from '@/lib/docusign/demo-data'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const expiring = sp.get('expiringInDays')
  const opts = {
    cpfCnpj: sp.get('cpfCnpj') || undefined,
    expiringInDays: expiring !== null && expiring !== '' ? Number(expiring) : undefined,
    q: sp.get('q') || undefined,
    limit: Number(sp.get('limit')) || undefined,
  }
  if (opts.expiringInDays !== undefined && Number.isNaN(opts.expiringInDays)) opts.expiringInDays = undefined

  if (!isConfigured()) {
    const agreements = filterAgreements(demoAgreements(), opts)
      .sort((a, b) => (a.expirationDate || '9999').localeCompare(b.expirationDate || '9999'))
    return NextResponse.json<AgreementsResponse>({ agreements, demo: true })
  }
  try {
    return NextResponse.json<AgreementsResponse>({ agreements: await listAgreements(opts) })
  } catch (err) {
    return routeErrorResponse(err, 'agreements', { agreements: [] })
  }
}
