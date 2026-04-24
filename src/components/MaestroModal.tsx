'use client'

import { useEffect, useState } from 'react'
import { X, Loader2 } from 'lucide-react'

interface Props {
  onClose: () => void
}

type Step = 'loading' | 'workflow' | 'demo' | 'error'

export default function MaestroModal({ onClose }: Props) {
  const [step, setStep] = useState<Step>('loading')
  const [embeddedUrl, setEmbeddedUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetch('/api/docusign/maestro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
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
            <p className="text-fontara-navy font-medium">Iniciando seu fluxo de contratação…</p>
          </div>
        )}

        {step === 'workflow' && embeddedUrl && (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-fontara-navy">Contratação via DocuSign Maestro</h2>
            </div>
            <iframe
              src={embeddedUrl}
              className="flex-1 w-full rounded-b-2xl border-0"
              title="DocuSign Maestro"
              allow="camera; microphone"
            />
          </>
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
            <p className="text-gray-500 text-sm mb-6">{errorMsg}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={onClose} className="btn-primary">Fechar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
