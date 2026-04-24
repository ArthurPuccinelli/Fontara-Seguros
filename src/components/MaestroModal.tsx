'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Loader2, CheckCircle } from 'lucide-react'

interface Props {
  onClose: () => void
  workflowId?: string
}

type Step = 'loading' | 'workflow' | 'completed' | 'demo' | 'error'

// DocuSign Maestro sends postMessage when a workflow instance finishes.
// Known event shapes (we handle all variants):
const isCompletionEvent = (data: unknown): boolean => {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  const type = String(d.type ?? d.messageType ?? d.eventType ?? '').toLowerCase()
  return (
    type.includes('complet') ||
    type.includes('finish') ||
    type.includes('done') ||
    type === 'maestro_workflow_completed' ||
    type === 'workflow_completed'
  )
}

export default function MaestroModal({ onClose, workflowId }: Props) {
  const [step, setStep] = useState<Step>('loading')
  const [embeddedUrl, setEmbeddedUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Trigger the workflow on mount
  useEffect(() => {
    fetch('/api/docusign/maestro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflowId ? { workflowId } : {}),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.demo) {
          setStep('demo')
        } else if (data.error) {
          setErrorMsg(data.error)
          setStep('error')
        } else if (data.embeddedUrl) {
          setEmbeddedUrl(data.embeddedUrl)
          setStep('workflow')
        } else {
          setErrorMsg('URL do fluxo de contratação não disponível.')
          setStep('error')
        }
      })
      .catch(() => {
        setErrorMsg('Erro de conexão. Tente novamente.')
        setStep('error')
      })
  }, [])

  // Listen for completion postMessage from the Maestro iframe
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (isCompletionEvent(event.data)) {
        setStep('completed')
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const isWorkflow = step === 'workflow'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full transition-all duration-300 ${
          isWorkflow ? 'max-w-4xl h-[90vh] flex flex-col' : 'max-w-md'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        {step === 'loading' && (
          <div className="p-16 flex flex-col items-center gap-4">
            <Loader2 size={44} className="text-fontara-accent animate-spin" />
            <p className="text-fontara-navy font-medium">Iniciando seu fluxo…</p>
          </div>
        )}

        {step === 'workflow' && embeddedUrl && (
          <>
            <div className="px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-fontara-navy">DocuSign Maestro</h2>
            </div>
            <iframe
              ref={iframeRef}
              src={embeddedUrl}
              className="flex-1 w-full rounded-b-2xl border-0"
              title="DocuSign Maestro"
              allow="camera; microphone"
            />
          </>
        )}

        {step === 'completed' && (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-fontara-navy mb-2">Concluído!</h2>
            <p className="text-gray-500 text-sm mb-6">
              Seu fluxo foi finalizado com sucesso.
            </p>
            <button onClick={onClose} className="btn-primary">Fechar</button>
          </div>
        )}

        {step === 'demo' && (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-fontara-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔧</span>
            </div>
            <h2 className="text-xl font-bold text-fontara-navy mb-2">Modo Demo</h2>
            <p className="text-gray-500 text-sm mb-6">
              Configure as variáveis de ambiente DocuSign no Netlify para ativar o fluxo Maestro real.
            </p>
            <button onClick={onClose} className="btn-primary">Fechar</button>
          </div>
        )}

        {step === 'error' && (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X size={24} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-fontara-navy mb-2">Ocorreu um erro</h2>
            <p className="text-gray-500 text-sm mb-6 break-all">{errorMsg}</p>
            <button onClick={onClose} className="btn-primary">Fechar</button>
          </div>
        )}
      </div>
    </div>
  )
}
