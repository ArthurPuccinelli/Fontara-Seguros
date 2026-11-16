import { NextRequest, NextResponse } from 'next/server'
import type { SigningViewRequest, SigningViewResponse } from '@/types/demo'
import { isConfigured, routeErrorResponse } from '@/lib/docusign/auth'
import { DOCUSIGN_JS_ORIGIN_DEMO, createRecipientView } from '@/lib/docusign/esign'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<SigningViewRequest>
  if (!isConfigured() || !body.envelopeId || body.envelopeId.startsWith('DEMO-')) {
    return NextResponse.json<SigningViewResponse>({ demo: true })
  }
  const missing = (['name', 'email', 'clientUserId', 'returnUrl'] as const).filter((k) => !body[k])
  if (missing.length) {
    return NextResponse.json<SigningViewResponse>({ error: `Campos obrigatórios ausentes: ${missing.join(', ')}` }, { status: 400 })
  }

  const origin = req.headers.get('origin') || req.nextUrl.origin
  const frameAncestors = body.frameAncestors?.length
    ? body.frameAncestors
    : Array.from(new Set([origin, DOCUSIGN_JS_ORIGIN_DEMO]))

  try {
    const url = await createRecipientView(body.envelopeId, {
      name: body.name!,
      email: body.email!,
      clientUserId: body.clientUserId!,
      returnUrl: body.returnUrl!,
      frameAncestors,
      messageOrigins: [DOCUSIGN_JS_ORIGIN_DEMO],
    })
    return NextResponse.json<SigningViewResponse>({ url })
  } catch (err) {
    return routeErrorResponse(err, 'signing-view')
  }
}
