'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

// API mínima do Docusign JS (https://js-d.docusign.com/bundle.js) para Web Forms.
// Fonte: https://developers.docusign.com/docs/web-forms-api/how-to/create-embed-web-form-instance
interface WebFormWidget {
  on: (event: string, handler: (e: unknown) => void) => void
  mount: (selector: string) => void
  unmount?: () => void
}
interface SigningWidget {
  on: (event: string, handler: (e: unknown) => void) => void
  mount: (selector: string) => void
}
export interface DocusignInstance {
  webforms: (cfg: { url: string; options: Record<string, unknown> }) => WebFormWidget
  signing: (cfg: { url: string; displayFormat: 'focused' | 'default'; style?: Record<string, unknown> }) => SigningWidget
}
declare global {
  interface Window {
    DocuSign?: {
      loadDocuSign: (integrationKey?: string) => Promise<DocusignInstance>
    }
  }
}

const SCRIPT_URL = process.env.NEXT_PUBLIC_DOCUSIGN_JS_URL || 'https://js-d.docusign.com/bundle.js'

let scriptPromise: Promise<void> | null = null
export function loadDocusignScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.DocuSign) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SCRIPT_URL
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => {
      scriptPromise = null
      reject(new Error('Falha ao carregar Docusign JS'))
    }
    document.head.appendChild(s)
  })
  return scriptPromise
}

interface Props {
  instanceUrl: string
  instanceToken?: string
  onSubmitted?: (event?: unknown) => void
  onSessionEnd?: (event?: unknown) => void
  // Assinatura após o envio: Focused View (padrão) ou tela clássica
  useFocusedViewForSigning?: boolean
}

export default function WebFormEmbed({ instanceUrl, instanceToken, onSubmitted, onSessionEnd, useFocusedViewForSigning = true }: Props) {
  const reactId = useId().replace(/:/g, '')
  const containerId = `docusign-webform-${reactId}`
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading')
  const submittedRef = useRef(onSubmitted)
  const endRef = useRef(onSessionEnd)
  submittedRef.current = onSubmitted
  endRef.current = onSessionEnd

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await loadDocusignScript()
        if (cancelled || !window.DocuSign) return
        const docusign = await window.DocuSign.loadDocuSign(process.env.NEXT_PUBLIC_DOCUSIGN_INTEGRATION_KEY || undefined)
        if (cancelled) return
        const widget = docusign.webforms({
          url: instanceUrl,
          options: {
            ...(instanceToken ? { instanceToken } : {}),
            autoResizeHeight: true,
            hideProgressBar: false,
            useFocusedViewForSigning,
            iframeStyles: { minHeight: '600px' },
          },
        })
        widget.on('ready', () => !cancelled && setStatus('ready'))
        widget.on('submitted', (e) => submittedRef.current?.(e))
        widget.on('sessionEnd', (e) => endRef.current?.(e))
        widget.mount(`#${containerId}`)
      } catch {
        if (!cancelled) setStatus('fallback')
      }
    })()
    // Se o widget não ficar pronto em 20s, usa iframe direto.
    const t = setTimeout(() => {
      if (!cancelled) setStatus((s) => (s === 'loading' ? 'fallback' : s))
    }, 20000)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [instanceUrl, instanceToken, containerId, useFocusedViewForSigning])

  // Fallback: iframe direto (formato documentado: formUrl#instanceToken=...)
  const fallbackSrc = instanceToken ? `${instanceUrl}#instanceToken=${instanceToken}` : instanceUrl

  if (status === 'fallback') {
    return (
      <iframe
        src={fallbackSrc}
        title="Formulário DocuSign"
        className="w-full min-h-[600px] h-[70vh] border-0 rounded-xl"
        allow="camera; microphone; geolocation"
      />
    )
  }

  return (
    <div className="relative">
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center py-16 pointer-events-none">
          <Loader2 size={36} className="text-fontara-accent animate-spin" />
        </div>
      )}
      <div id={containerId} className="min-h-[200px]" />
    </div>
  )
}
