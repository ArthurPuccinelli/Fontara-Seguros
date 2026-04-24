import { NextRequest, NextResponse } from 'next/server'

const MAESTRO_WORKFLOW_ID = process.env.DOCUSIGN_MAESTRO_WORKFLOW_ID || '0359ae48-47dc-45be-a7b8-9ae20894eaba'

async function getAccessToken(): Promise<string> {
  const {
    DOCUSIGN_INTEGRATION_KEY,
    DOCUSIGN_USER_ID,
    DOCUSIGN_PRIVATE_KEY,
    DOCUSIGN_AUTH_SERVER = 'account-d.docusign.com',
  } = process.env

  const privateKey = Buffer.from(DOCUSIGN_PRIVATE_KEY!.replace(/\\n/g, '\n'), 'utf8')

  const docusign = await import('docusign-esign')
  const apiClient = new docusign.ApiClient()
  apiClient.setOAuthBasePath(DOCUSIGN_AUTH_SERVER)

  const result = await apiClient.requestJWTUserToken(
    DOCUSIGN_INTEGRATION_KEY!,
    DOCUSIGN_USER_ID!,
    ['signature', 'impersonation', 'aow_manage'],
    privateKey,
    3600
  )

  return result.body.access_token
}

async function maestroFetch(path: string, method: string, token: string, body?: unknown) {
  const maestroBase = (
    process.env.DOCUSIGN_MAESTRO_BASE_URL || 'https://api-d.docusign.com/v1'
  ).replace(/\/$/, '')

  const res = await fetch(`${maestroBase}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Maestro ${method} ${path} → ${res.status}: ${text}`)
  }

  return res.json()
}

export async function POST(req: NextRequest) {
  try {
    const userInputs: Record<string, unknown> = await req.json()

    const {
      DOCUSIGN_INTEGRATION_KEY,
      DOCUSIGN_USER_ID,
      DOCUSIGN_ACCOUNT_ID,
      DOCUSIGN_PRIVATE_KEY,
    } = process.env

    // Demo mode — env vars not configured
    if (!DOCUSIGN_INTEGRATION_KEY || !DOCUSIGN_USER_ID || !DOCUSIGN_ACCOUNT_ID || !DOCUSIGN_PRIVATE_KEY) {
      return NextResponse.json({
        demo: true,
        message: 'Configure as variáveis de ambiente DocuSign para ativar o fluxo Maestro.',
      })
    }

    const accessToken = await getAccessToken()

    // Fetch trigger requirements to build valid inputs
    let triggerInputs: Record<string, unknown> = {}
    try {
      const requirements = await maestroFetch(
        `/accounts/${DOCUSIGN_ACCOUNT_ID}/workflows/${MAESTRO_WORKFLOW_ID}/trigger-requirements`,
        'GET',
        accessToken
      )

      if (Array.isArray(requirements.trigger_input_schema)) {
        for (const field of requirements.trigger_input_schema) {
          const name: string = field?.field_name
          if (!name) continue
          const type = String(field?.field_data_type || '').toLowerCase()

          if (userInputs[name] !== undefined) {
            triggerInputs[name] = userInputs[name]
          } else {
            // Try case-insensitive match on user inputs
            const key = Object.keys(userInputs).find(
              (k) => k.toLowerCase() === name.toLowerCase()
            )
            if (key) {
              triggerInputs[name] = userInputs[key]
            } else {
              switch (type) {
                case 'date':
                  triggerInputs[name] = new Date().toISOString().split('T')[0]
                  break
                case 'number':
                  triggerInputs[name] = 0
                  break
                case 'boolean':
                  triggerInputs[name] = false
                  break
                default:
                  triggerInputs[name] = ''
              }
            }
          }
        }
      }
    } catch {
      // If requirements fetch fails, pass user inputs directly
      triggerInputs = userInputs
    }

    // Trigger workflow instance
    const triggerResult = await maestroFetch(
      `/accounts/${DOCUSIGN_ACCOUNT_ID}/workflows/${MAESTRO_WORKFLOW_ID}/actions/trigger`,
      'POST',
      accessToken,
      {
        instance_name: `Fontara Seguros - ${new Date().toISOString()}`,
        trigger_inputs: Object.keys(triggerInputs).length > 0 ? triggerInputs : undefined,
      }
    )

    const instanceId =
      triggerResult.instanceId ?? triggerResult.instance_id ?? triggerResult.id

    if (!instanceId) {
      throw new Error('Workflow trigger did not return an instanceId')
    }

    // Get embedded URL for the workflow instance
    const embedData = await maestroFetch(
      `/workflows/instances/${instanceId}/embeddedUrl`,
      'GET',
      accessToken
    )

    return NextResponse.json({
      instanceId,
      embeddedUrl: embedData?.url ?? embedData?.embeddedUrl ?? null,
    })
  } catch (err) {
    console.error('Maestro route error:', err)
    return NextResponse.json(
      { error: 'Erro ao iniciar o fluxo de contratação. Tente novamente.' },
      { status: 500 }
    )
  }
}
