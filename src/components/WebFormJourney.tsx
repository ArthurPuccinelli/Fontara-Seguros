'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle, FlaskConical, Loader2, AlertTriangle, ExternalLink } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import WebFormEmbed from './WebFormEmbed'
import EmbedModeToggle from './EmbedModeToggle'
import { useEmbedMode } from '@/lib/embedMode'
import type { WebFormInstanceResponse } from '@/types/demo'

interface Props {
  journey: string
  title?: string
  onDone?: () => void
}

type State =
  | { s: 'loading' }
  | { s: 'ready'; url: string; token?: string }
  | { s: 'demo'; message?: string }
  | { s: 'error'; message: string; consentUrl?: string }
  | { s: 'done'; demo?: boolean }

// Cria uma instância de Web Form (pré-preenchida com o perfil de demo) e a embarca.
export default function WebFormJourney({ journey, title, onDone }: Props) {
  const { profile } = useAuth()
  const [state, setState] = useState<State>({ s: 'loading' })
  const [mode] = useEmbedMode()
  const profileRef = useRef(profile)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  // Uma nova instância é criada quando o formato da assinatura muda (o token vale 5 min e é de uso único)
  useEffect(() => {
    let cancelled = false
    setState({ s: 'loading' })
    const p = profileRef.current
    fetch('/api/docusign/webforms/instance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        journey,
        clientUserId: p.email,
        // Chaves = "Nome de referência da API" de cada campo do Web Form (iguais aos tabLabels do template)
        formValues: {
          Nome_do_Titular: p.name,
          Email_do_Titular: p.email,
          NomeTitular: p.name,
          CpfTitular: p.cpf,
          NumeroCertificado: 'CERT-PGBL-2020-0031942',
        },
      }),
    })
      .then((r) => r.json() as Promise<WebFormInstanceResponse & { consentUrl?: string }>)
      .then((d) => {
        if (cancelled) return
        if (d.error) setState({ s: 'error', message: d.error, consentUrl: d.consentUrl })
        else if (d.demo) setState({ s: 'demo', message: d.message })
        else if (d.instanceUrl) setState({ s: 'ready', url: d.instanceUrl, token: d.instanceToken })
        else setState({ s: 'error', message: 'Instância do formulário não disponível.' })
      })
      .catch(() => !cancelled && setState({ s: 'error', message: 'Erro de conexão. Tente novamente.' }))
    return () => {
      cancelled = true
    }
  }, [journey, mode])

  function finish(demo?: boolean) {
    setState({ s: 'done', demo })
    doneRef.current?.()
  }

  if (state.s === 'loading')
    return (
      <div className="py-16 flex flex-col items-center gap-3">
        <Loader2 size={40} className="text-fontara-accent animate-spin" />
        <p className="text-sm text-fontara-navy font-medium">Preparando formulário…</p>
      </div>
    )

  if (state.s === 'ready')
    return (
      <div className="min-h-full flex flex-col">
        <div className="flex-1">
      <WebFormEmbed
        key={mode}
        instanceUrl={state.url}
        instanceToken={state.token}
        useFocusedViewForSigning={mode === 'focused'}
        onSubmitted={() => undefined}
        onSessionEnd={(e) => {
          const type = String((e as { sessionEndType?: string } | undefined)?.sessionEndType ?? '')
          if (type !== 'sessionTimeout' && type !== 'finishLater') finish()
        }}
      />
        </div>
        <div className="sticky bottom-0 bg-white flex justify-end px-2 py-1 border-t border-gray-100">
          <EmbedModeToggle />
        </div>
      </div>
    )

  if (state.s === 'demo')
    return (
      <div className="p-6 sm:p-8 max-w-md mx-auto text-center">
        <div className="w-14 h-14 bg-fontara-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FlaskConical size={26} className="text-fontara-gold" />
        </div>
        <h3 className="text-lg font-bold text-fontara-navy mb-1">Modo demonstração</h3>
        {title && <p className="text-sm text-gray-500 mb-3">{title}</p>}
        <p className="text-xs text-gray-500 leading-relaxed mb-4">
          Em produção, um Web Form do DocuSign abriria aqui com os campos já pré-preenchidos com os seus dados
          (nome, CPF, e-mail e nº do certificado). Ao enviar, o documento é gerado e segue para assinatura no formato escolhido (Focused View ou clássica).
        </p>
        {state.message && <p className="text-xs text-gray-400 mb-4">{state.message}</p>}
        <button onClick={() => finish(true)} className="btn-primary text-sm">Simular envio</button>
      </div>
    )

  if (state.s === 'error')
    return (
      <div className="p-8 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={26} className="text-red-500" />
        </div>
        <p className="text-sm text-gray-600 mb-3 break-words">{state.message}</p>
        {state.consentUrl && (
          <a href={state.consentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-fontara-accent font-semibold hover:underline">
            <ExternalLink size={14} /> Conceder consentimento no DocuSign
          </a>
        )}
      </div>
    )

  return (
    <div className="p-8 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={32} className="text-green-500" />
      </div>
      <h3 className="text-xl font-bold text-fontara-navy mb-2">Solicitação enviada e assinada</h3>
      <p className="text-sm text-gray-500">
        Recebemos seu pedido{state.demo ? ' (simulado)' : ''}. Uma cópia do documento assinado será enviada para o seu e-mail.
      </p>
    </div>
  )
}
