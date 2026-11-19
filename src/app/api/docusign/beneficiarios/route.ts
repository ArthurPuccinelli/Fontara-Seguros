import { NextRequest, NextResponse } from 'next/server'
import { isConfigured, routeErrorResponse } from '@/lib/docusign/auth'
import { createBeneficiariosEnvelope, type BeneficiariosData } from '@/lib/docusign/esign'

export const dynamic = 'force-dynamic'

// POST: alteração de beneficiários (C5) -> envelope do modelo de envelope ligado ao Modelo de documento,
// com tabela dinâmica de beneficiários e cláusulas condicionais (Produto, TemMenor). Devolve clientUserId
// para a assinatura embarcada (Focused View / Clássica).
export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as Partial<BeneficiariosData>
  const benefs = (b.beneficiarios || []).filter((x) => x?.nome?.trim()).slice(0, 10)
  const soma = benefs.reduce((s, x) => s + Number(x.percentual || 0), 0)
  if (!b.signerName || !b.signerEmail || !b.produto || !benefs.length) {
    return NextResponse.json({ error: 'Informe o segurado, o produto e ao menos um beneficiário.' }, { status: 400 })
  }
  if (Math.round(soma) !== 100) {
    return NextResponse.json({ error: `Os percentuais somam ${soma}%. Ajuste para 100%.` }, { status: 400 })
  }
  const clientUserId = `ben-${b.signerEmail.toLowerCase()}`
  if (!isConfigured()) {
    return NextResponse.json({ envelopeId: `DEMO-${Date.now()}`, clientUserId, protocolo: 'BEN-DEMO', demo: true })
  }
  try {
    const out = await createBeneficiariosEnvelope(
      {
        signerName: b.signerName,
        signerEmail: b.signerEmail,
        cpf: b.cpf || '',
        certificado: b.certificado || '—',
        produto: b.produto === 'Previdência' ? 'Previdência' : 'Vida',
        beneficiarios: benefs.map((x) => ({ nome: x.nome, parentesco: x.parentesco, percentual: Number(x.percentual), menor: !!x.menor })),
      },
      clientUserId,
    )
    return NextResponse.json(out)
  } catch (err) {
    return routeErrorResponse(err, 'beneficiarios')
  }
}
