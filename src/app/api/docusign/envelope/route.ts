import { NextRequest, NextResponse } from 'next/server'
import { isConfigured, isConsentError } from '@/lib/docusign/auth'
import { createProposalEnvelope, createRecipientView, type ProposalData } from '@/lib/docusign/esign'

export const dynamic = 'force-dynamic'

interface EnvelopeRequest extends ProposalData {
  embedded?: boolean
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as EnvelopeRequest

    if (!body.signerName || !body.signerEmail || !body.tipoSeguro) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes' }, { status: 400 })
    }

    if (!isConfigured()) {
      return NextResponse.json({
        envelopeId: `DEMO-${Date.now()}`,
        status: 'sent',
        message: '(Modo demo) Configure as variáveis de ambiente do DocuSign para envio real.',
        demo: true,
      })
    }

    const embedded = body.embedded !== false // padrão histórico: assinatura embutida (signingUrl)
    const envelope = await createProposalEnvelope(body, { embedded })

    let signingUrl: string | undefined
    if (embedded && envelope.clientUserId) {
      const origin = req.headers.get('origin') || req.nextUrl.origin
      signingUrl = await createRecipientView(envelope.envelopeId, {
        name: body.signerName,
        email: body.signerEmail,
        clientUserId: envelope.clientUserId,
        recipientId: '1',
        returnUrl: `${origin}?signed=1`,
      })
    }

    return NextResponse.json({
      envelopeId: envelope.envelopeId,
      signingUrl,
      clientUserId: envelope.clientUserId,
      status: envelope.status,
    })
  } catch (err) {
    if (isConsentError(err)) {
      return NextResponse.json({ error: err.message, consentUrl: err.consentUrl }, { status: 401 })
    }
    console.error('DocuSign error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Erro ao criar envelope DocuSign. Tente novamente.' }, { status: 500 })
  }
}
