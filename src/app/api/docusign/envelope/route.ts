import { NextRequest, NextResponse } from 'next/server'

interface EnvelopeRequest {
  signerName: string
  signerEmail: string
  cpf: string
  phone: string
  tipoSeguro: string
  valorCobertura?: string
  observacoes?: string
}

const TIPO_LABELS: Record<string, string> = {
  vida: 'Seguro de Vida',
  auto: 'Seguro Auto',
  residencial: 'Seguro Residencial',
  empresarial: 'Seguro Empresarial',
  saude: 'Seguro Saúde',
  viagem: 'Seguro Viagem',
}

function buildPropostaHtml(data: EnvelopeRequest): string {
  const hoje = new Date().toLocaleDateString('pt-BR')
  const tipoLabel = TIPO_LABELS[data.tipoSeguro] || data.tipoSeguro

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; color: #1a1a2e; margin: 0; padding: 40px; }
    .header { background: #0f2044; color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 8px 0 0; opacity: 0.7; font-size: 14px; }
    .section { margin-bottom: 24px; }
    .section h2 { color: #0f2044; font-size: 18px; border-bottom: 2px solid #e8f0fe; padding-bottom: 8px; }
    .field { display: flex; margin-bottom: 8px; }
    .field label { font-weight: bold; width: 200px; color: #555; font-size: 14px; }
    .field span { font-size: 14px; }
    .highlight { background: #e8f0fe; border-left: 4px solid #2563eb; padding: 16px 20px; border-radius: 4px; margin: 20px 0; }
    .signature-area { margin-top: 60px; border-top: 1px solid #ccc; padding-top: 30px; }
    .sig-line { border-bottom: 1px solid #333; height: 40px; margin-bottom: 8px; }
    .footer { margin-top: 40px; font-size: 11px; color: #999; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Fontara Seguros</h1>
    <p>Proposta Comercial · ${hoje}</p>
  </div>
  <div class="section">
    <h2>Dados do Solicitante</h2>
    <div class="field"><label>Nome:</label><span>${data.signerName}</span></div>
    <div class="field"><label>E-mail:</label><span>${data.signerEmail}</span></div>
    <div class="field"><label>CPF:</label><span>${data.cpf}</span></div>
    <div class="field"><label>Telefone:</label><span>${data.phone}</span></div>
  </div>
  <div class="section">
    <h2>Produto Solicitado</h2>
    <div class="field"><label>Tipo de Seguro:</label><span>${tipoLabel}</span></div>
    ${data.valorCobertura ? `<div class="field"><label>Cobertura desejada:</label><span>${data.valorCobertura}</span></div>` : ''}
    ${data.observacoes ? `<div class="field"><label>Observações:</label><span>${data.observacoes}</span></div>` : ''}
  </div>
  <div class="highlight">
    <strong>Próximos passos:</strong> Nossa equipe entrará em contato em até 24 horas com as melhores
    opções de cobertura disponíveis para o seu perfil.
  </div>
  <div class="signature-area">
    <p><strong>Concordo com os termos desta proposta e autorizo a análise do meu perfil de risco.</strong></p>
    <br/>
    <div class="sig-line"></div>
    <p style="font-size:12px;color:#555;">Assinatura do Solicitante — ${data.signerName}</p>
    <p style="font-size:12px;color:#555;">Data: ___/___/______</p>
  </div>
  <div class="footer">Fontara Seguros · Av. Paulista, 1000 — São Paulo, SP · CNPJ 00.000.000/0001-00</div>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  try {
    const body: EnvelopeRequest = await req.json()

    if (!body.signerName || !body.signerEmail || !body.tipoSeguro) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes' }, { status: 400 })
    }

    const {
      DOCUSIGN_INTEGRATION_KEY,
      DOCUSIGN_USER_ID,
      DOCUSIGN_ACCOUNT_ID,
      DOCUSIGN_PRIVATE_KEY,
      DOCUSIGN_BASE_PATH = 'https://demo.docusign.net/restapi',
    } = process.env

    if (!DOCUSIGN_INTEGRATION_KEY || !DOCUSIGN_USER_ID || !DOCUSIGN_ACCOUNT_ID || !DOCUSIGN_PRIVATE_KEY) {
      return NextResponse.json({
        envelopeId: `DEMO-${Date.now()}`,
        status: 'sent',
        message: '(Modo demo) Configure as variáveis de ambiente do DocuSign para envio real.',
        demo: true,
      })
    }

    const docusign = await import('docusign-esign')
    const apiClient = new docusign.ApiClient()
    apiClient.setBasePath(DOCUSIGN_BASE_PATH)

    const privateKey = Buffer.from(DOCUSIGN_PRIVATE_KEY.replace(/\\n/g, '\n'), 'utf8')
    const tokenResult = await apiClient.requestJWTUserToken(
      DOCUSIGN_INTEGRATION_KEY,
      DOCUSIGN_USER_ID,
      ['signature'],
      privateKey,
      3600
    )
    apiClient.addDefaultHeader('Authorization', `Bearer ${tokenResult.body.access_token}`)

    const htmlDoc = buildPropostaHtml(body)
    const docBase64 = Buffer.from(htmlDoc).toString('base64')

    const envelopesApi = new docusign.EnvelopesApi(apiClient)

    const envelopeDefinition = new docusign.EnvelopeDefinition()
    envelopeDefinition.emailSubject = `Fontara Seguros — Proposta de ${TIPO_LABELS[body.tipoSeguro] || body.tipoSeguro}`

    const doc = new docusign.Document()
    doc.documentBase64 = docBase64
    doc.name = 'Proposta Fontara Seguros'
    doc.fileExtension = 'html'
    doc.documentId = '1'

    const signer = docusign.Signer.constructFromObject({
      email: body.signerEmail,
      name: body.signerName,
      recipientId: '1',
      routingOrder: '1',
    })

    const signHere = docusign.SignHere.constructFromObject({
      anchorString: 'Assinatura do Solicitante',
      anchorYOffset: '10',
      anchorUnits: 'pixels',
      anchorXOffset: '0',
    })

    signer.tabs = new docusign.Tabs()
    signer.tabs.signHereTabs = [signHere]

    const recipients = new docusign.Recipients()
    recipients.signers = [signer]

    envelopeDefinition.documents = [doc]
    envelopeDefinition.recipients = recipients
    envelopeDefinition.status = 'sent'

    const envelopeResult = await envelopesApi.createEnvelope(DOCUSIGN_ACCOUNT_ID, {
      envelopeDefinition,
    })

    const origin = req.headers.get('origin') || 'https://fontaraseguros.netlify.app'
    const viewRequest = docusign.RecipientViewRequest.constructFromObject({
      returnUrl: `${origin}?signed=1`,
      authenticationMethod: 'none',
      email: body.signerEmail,
      userName: body.signerName,
      recipientId: '1',
    })

    const viewResult = await envelopesApi.createRecipientView(
      DOCUSIGN_ACCOUNT_ID,
      envelopeResult.envelopeId!,
      { recipientViewRequest: viewRequest }
    )

    return NextResponse.json({
      envelopeId: envelopeResult.envelopeId,
      signingUrl: viewResult.url,
      status: envelopeResult.status,
    })
  } catch (err) {
    console.error('DocuSign error:', err)
    return NextResponse.json(
      { error: 'Erro ao criar envelope DocuSign. Tente novamente.' },
      { status: 500 }
    )
  }
}
