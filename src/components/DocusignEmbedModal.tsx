'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Loader2, CheckCircle, FlaskConical, AlertTriangle, ExternalLink } from 'lucide-react'

export interface EmbedStartResult {
  url?: string
  demo?: boolean
  message?: string
  error?: string
  consentUrl?: string
}

interface Props {
  title: string
  subtitle?: string
  onClose: () => void
  start: () => Promise<EmbedStartResult>
  onCompleted?: () => void
}

type Step = 'loading' | 'embedded' | 'completed' | 'demo' | 'error'

// DocuSign (Maestro / Web Forms / eSignature) envia postMessage ao concluir.
// Tratamos as variantes conhecidas.
export const isCompletionEvent = (data: unknown): boolean => {
  if (!data) return false
  if (typeof data === 'string') {
    const t = data.toLowerCase()
    return t.includes('complet') || t.includes('finish') || t.includes('signing_complete')
  }
  if (typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  const type = String(d.type ?? d.messageType ?? d.eventType ?? d.event ?? '').toLowerCase()
  return (
    type.includes('complet') ||
    type.includes('finish') ||
    type.includes('done') ||
    type === 'maestro_workflow_completed' ||
    type === 'workflow_completed'
  )
}

export const isDocusignOrigin = (origin: string): boolean => {
  try {
    const host = new URL(origin).hostname.toLowerCase()
    return host.endsWith('.docusign.com') || host.endsWith('.docusign.net')
  } catch {
    return false
  }
}

export default function DocusignEmbedModal({ title, subtitle, onClose, start, onCompleted }: Props) {
  const [step, setStep] = useState<Step>('loading')
  const [url, setUrl] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [consentUrl, setConsentUrl] = useState<string | null>(null)
  const startRef = useRef(start)
  const completedRef = useRef(onCompleted)
  completedRef.current = onCompleted

  useEffect(() => {
    let cancelled = false
    startRef
      .current()
      .then((res) => {
        if (cancelled) return
        if (res.error) {
          setMessage(res.error)
          setConsentUrl(res.consentUrl ?? null)
          setStep('error')
        } else if (res.demo) {
          setMessage(res.message ?? '')
          setStep('demo')
        } else if (res.url) {
          setUrl(res.url)
          setStep('embedded')
        } else {
          setMessage('URL da experiência DocuSign não disponível.')
          setStep('error')
        }
      })
      .catch(() => {
        if (cancelled) return
        setMessage('Erro de conexão. Tente novamente.')
        setStep('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!isDocusignOrigin(event.origin)) return
      if (isCompletionEvent(event.data)) {
        setStep('completed')
        completedRef.current?.()
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const embedded = step === 'embedded'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}>
      <div
        className={`relative bg-white shadow-2xl w-full transition-all duration-300 ${
          embedded ? 'max-w-4xl h-[88vh] flex flex-col rounded-xl border-2 border-fontara-navy' : 'rounded-2xl max-w-md max-h-[90vh] overflow-y-auto'
        }`}
      >
        <button
          onClick={onClose}
          className={
            embedded
              ? 'absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-fontara-navy text-white flex items-center justify-center shadow-md hover:bg-fontara-blue transition'
              : 'absolute top-4 right-4 z-10 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors'
          }
          aria-label="Fechar"
        >
          <X size={embedded ? 16 : 20} />
        </button>

        {step === 'loading' && (
          <div className="p-16 flex flex-col items-center gap-4">
            <Loader2 size={44} className="text-fontara-accent animate-spin" />
            <p className="text-fontara-navy font-medium">Iniciando…</p>
            <p className="text-gray-400 text-xs text-center">{title}</p>
          </div>
        )}

        {embedded && url && (
          <iframe
            src={url}
            className="flex-1 w-full rounded-[10px] border-0"
            title={title}
            allow="camera; microphone; geolocation"
          />
        )}

        {step === 'completed' && (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-fontara-navy mb-2">Concluído!</h2>
            <p className="text-gray-500 text-sm mb-6">Seu fluxo foi finalizado com sucesso.</p>
            <button onClick={onClose} className="btn-primary">Fechar</button>
          </div>
        )}

        {step === 'demo' && (
          <div className="p-8">
            <div className="w-14 h-14 bg-fontara-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FlaskConical size={26} className="text-fontara-gold" />
            </div>
            <h2 className="text-xl font-bold text-fontara-navy mb-1 text-center">Modo demonstração</h2>
            <p className="text-gray-500 text-sm mb-4 text-center">{title}</p>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-600 space-y-2">
              <p className="font-semibold text-fontara-navy text-xs uppercase tracking-wide">O que aconteceria em produção</p>
              <ol className="list-decimal list-inside space-y-1 text-xs leading-relaxed">
                <li>Os dados do seu perfil de demo são enviados ao DocuSign.</li>
                <li>A experiência embarcada abre aqui, dentro do portal.</li>
                <li>Documentos são gerados e enviados para assinatura automaticamente.</li>
                <li>Você acompanha o status em tempo real.</li>
              </ol>
              {message && <p className="text-xs text-gray-500 pt-2 border-t border-gray-200">{message}</p>}
            </div>
            <p className="text-[11px] text-gray-400 mt-3 text-center">
              Configure as variáveis de ambiente DocuSign para ativar a experiência real.
            </p>
            <div className="text-center mt-5">
              <button onClick={onClose} className="btn-primary">Fechar</button>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-fontara-navy mb-2">Ocorreu um erro</h2>
            <p className="text-gray-500 text-sm mb-4 break-words">{message}</p>
            {consentUrl && (
              <a
                href={consentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-fontara-accent font-semibold hover:underline mb-5"
              >
                <ExternalLink size={14} />
                Conceder consentimento no DocuSign
              </a>
            )}
            <div>
              <button onClick={onClose} className="btn-primary">Fechar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
