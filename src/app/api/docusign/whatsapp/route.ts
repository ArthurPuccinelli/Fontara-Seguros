import { NextRequest, NextResponse } from 'next/server'
import { isConfigured, routeErrorResponse } from '@/lib/docusign/auth'
import { createWhatsAppProposal, getWhatsAppStatus, toBrPhone } from '@/lib/docusign/esign'

export const dynamic = 'force-dynamic'

export interface WhatsAppContratacaoRequest {
  name: string
  phone: string
  email?: string
  cpf?: string
  birthDate?: string
  address?: string
  produto: string
  valorContribuicao: string
  periodicidade: string
  beneficiarios?: string
  canal?: string
}

// POST: contratação do cliente -> envelope do template PF entregue por WhatsApp (sem e-mail ao titular).
export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as Partial<WhatsAppContratacaoRequest>
  const phone = toBrPhone(b.phone || '')
  if (!b.name || phone.number.length < 10 || !b.produto) {
    return NextResponse.json({ error: 'Informe nome, produto e um celular com DDD.' }, { status: 400 })
  }

  const now = new Date()
  const numeroProposta = `FS-${now.getFullYear()}-${String(now.getTime()).slice(-6)}`
  if (!isConfigured()) {
    return NextResponse.json({ envelopeId: `DEMO-${Date.now()}`, numeroProposta, status: 'sent', demo: true })
  }

  try {
    const env = await createWhatsAppProposal({
      name: b.name,
      phone: b.phone!,
      ccEmail: b.email || undefined,
      fields: {
        NumeroProposta: numeroProposta,
        DataProposta: now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        NomeTitular: b.name,
        CpfTitular: b.cpf || '',
        EmailTitular: b.email || '',
        CelularTitular: b.phone || '',
        DataNascimento: b.birthDate ? b.birthDate.split('-').reverse().join('/') : '',
        Endereco: b.address || '',
        Produto: b.produto,
        ValorContribuicao: b.valorContribuicao || '',
        Periodicidade: b.periodicidade || '',
        Canal: b.canal || 'Área do Cliente (WhatsApp)',
        Corretor: 'Central Fontara Seguros',
        Beneficiarios: b.beneficiarios || '',
      },
    })
    return NextResponse.json({ ...env, numeroProposta })
  } catch (err) {
    return routeErrorResponse(err, 'whatsapp')
  }
}

// GET ?envelopeId= : status do envelope e do signatário (polling da tela).
export async function GET(req: NextRequest) {
  const envelopeId = req.nextUrl.searchParams.get('envelopeId') || ''
  if (!envelopeId) return NextResponse.json({ error: 'envelopeId obrigatório' }, { status: 400 })
  if (!isConfigured() || envelopeId.startsWith('DEMO-')) {
    const age = Date.now() - Number(envelopeId.replace('DEMO-', '') || Date.now())
    const status = age > 25000 ? 'completed' : age > 8000 ? 'delivered' : 'sent'
    return NextResponse.json({ envelopeId, status, signerStatus: status, demo: true })
  }
  try {
    return NextResponse.json(await getWhatsAppStatus(envelopeId))
  } catch (err) {
    return routeErrorResponse(err, 'whatsapp-status')
  }
}
