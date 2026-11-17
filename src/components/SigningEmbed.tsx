'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { loadDocusignScript } from './WebFormEmbed'
import EmbedModeToggle from './EmbedModeToggle'
import { useEmbedMode } from '@/lib/embedMode'
import type { SigningViewResponse } from '@/types/demo'

interface Props {
  envelopeId: string
  name: string
  email: string
  clientUserId: string
  onFinished?: (event?: unknown) => void
}

// Assinatura embarcada com Docusign JS. Cada abertura gera um novo recipient view
// (URL de uso único) com frameAncestors/messageOrigins, exigidos pelo Focused View.
export default function SigningEmbed({ envelopeId, name, email, clientUserId, onFinished }: Props) {
  const [mode] = useEmbedMode()
  const reactId = useId().replace(/:/g, '')
  const containerId = `docusign-signing-${reactId}`
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')
  const finishedRef = useRef(onFinished)
  finishedRef.current = onFinished

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    ;(async () => {
      try {
        const res = await fetch('/api/docusign/signing-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ envelopeId, name, email, clientUserId, returnUrl: `${window.location.origin}/?signed=1` }),
        })
        const data = (await res.json()) as SigningViewResponse
        if (cancelled) return
        if (!data.url) throw new Error(data.error || 'Não foi possível abrir a assinatura.')
        await loadDocusignScript()
        if (cancelled || !window.DocuSign) return
        const docusign = await window.DocuSign.loadDocuSign(process.env.NEXT_PUBLIC_DOCUSIGN_INTEGRATION_KEY || undefined)
        if (cancelled) return
        const signing = docusign.signing({
          url: data.url,
          displayFormat: mode === 'focused' ? 'focused' : 'default',
          style: {
            branding: { primaryButton: { backgroundColor: '#0f2044', color: '#ffffff' } },
            signingNavigationButton: { finishText: 'Concluir assinatura', position: 'bottom-right' },
          },
        })
        signing.on('ready', () => !cancelled && setStatus('ready'))
        signing.on('sessionEnd', (e) => finishedRef.current?.(e))
        signing.mount(`#${containerId}`)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Erro ao abrir a assinatura.')
          setStatus('error')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [envelopeId, name, email, clientUserId, mode, containerId])

  return (
    <div className="h-full flex flex-col">
      {status === 'error' ? (
        <div className="p-8 text-center">
          <AlertTriangle size={28} className="text-red-500 mx-auto mb-3" />
          <p className="text-sm text-gray-600 break-words">{error}</p>
        </div>
      ) : (
        <div className="relative flex-1 min-h-[480px]">
          {status === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Loader2 size={36} className="text-fontara-accent animate-spin" />
            </div>
          )}
          <div id={containerId} key={mode} className="w-full h-full min-h-[480px]" />
        </div>
      )}
      <div className="flex justify-end px-2 py-1 border-t border-gray-100">
        <EmbedModeToggle />
      </div>
    </div>
  )
}
