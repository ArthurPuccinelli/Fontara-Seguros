import { NextResponse } from 'next/server'
import { getConsentUrl, getScopes, isConfigured } from '@/lib/docusign/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isConfigured()) return NextResponse.json({ demo: true, consentUrl: null, error: 'DocuSign não configurado' })
  return NextResponse.json({ consentUrl: getConsentUrl(), scopes: getScopes() })
}
