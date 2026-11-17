'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, Play } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getJourney } from '@/lib/journeys'
import JourneyForm from '@/components/JourneyForm'
import DocusignEmbedModal from '@/components/DocusignEmbedModal'
import WebFormJourney from '@/components/WebFormJourney'
import WhatsAppJourney from '@/components/WhatsAppJourney'
import type { JourneyMode, MaestroTriggerResponse } from '@/types/demo'

const TAB_LABEL: Record<JourneyMode, string> = {
  api: 'Formulário do portal (API)',
  'embedded-workflow': 'Experiência DocuSign embarcada',
  'embedded-webform': 'Web Form DocuSign embarcado',
  whatsapp: 'Envio por WhatsApp',
}

export default function NovaJornadaPage() {
  const params = useParams<{ slug: string }>()
  const journey = getJourney(params.slug)
  const { profile } = useAuth()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<JourneyMode | null>(
    searchParams.get('modo') === 'embarcado' ? 'embedded-workflow' : null,
  )
  const [modal, setModal] = useState(false)

  if (!journey) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Jornada não encontrada.</p>
        <Link href="/canal" className="text-fontara-accent font-semibold hover:underline">Voltar ao catálogo</Link>
      </div>
    )
  }

  const active = tab ?? journey.modes[0]

  async function startWorkflow() {
    const res = await fetch('/api/docusign/maestro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        journey: journey!.slug,
        mode: 'embedded-workflow',
        inputs: { name: profile.name, email: profile.email, cpf: profile.cpf, phone: profile.phone, address: profile.address },
      }),
    })
    const d = (await res.json()) as MaestroTriggerResponse & { consentUrl?: string }
    return { url: d.embeddedUrl, demo: d.demo, message: d.message, error: d.error, consentUrl: d.consentUrl }
  }

  return (
    <div>
      <Link href="/canal" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-fontara-navy mb-4">
        <ArrowLeft size={15} /> Catálogo de jornadas
      </Link>
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span className="text-[11px] font-semibold bg-fontara-gold/15 text-amber-800 px-2 py-1 rounded-full">substitui {journey.popCode}</span>
        {journey.produtos.map((p) => (
          <span key={p} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{p}</span>
        ))}
      </div>
      <h1 className="text-2xl font-bold text-fontara-navy">{journey.title}</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6 max-w-2xl">{journey.description}</p>

      {journey.modes.length > 1 && (
        <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto" role="tablist">
          {journey.modes.map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={active === m}
              onClick={() => setTab(m)}
              className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition ${
                active === m ? 'border-fontara-accent text-fontara-accent font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {TAB_LABEL[m]}
            </button>
          ))}
        </div>
      )}

      {active === 'api' && <JourneyForm journey={journey.slug} />}

      {active === 'embedded-workflow' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-2xl">
          <h2 className="font-semibold text-fontara-navy mb-2">Experiência DocuSign embarcada</h2>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            O formulário e as regras da jornada são desenhados no DocuSign (Workflow Builder) e renderizados dentro do portal.
            A TI não precisa construir telas: alterar o POP é alterar o workflow. Os dados do seu perfil de demo
            ({profile.name}, {profile.email}) são enviados como entrada.
          </p>
          <button onClick={() => setModal(true)} className="inline-flex items-center gap-2 bg-fontara-navy text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-fontara-navy/90 transition">
            <Play size={15} /> Iniciar experiência
          </button>
        </div>
      )}

      {active === 'embedded-webform' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <WebFormJourney journey={journey.slug} title={journey.title} />
        </div>
      )}

      {active === 'whatsapp' && (
        <div className="bg-white rounded-lg border border-gray-200 max-w-4xl">
          <WhatsAppJourney origem="canal" />
        </div>
      )}

      {modal && (
        <DocusignEmbedModal
          title={journey.title}
          subtitle="Experiência DocuSign embarcada"
          start={startWorkflow}
          onClose={() => setModal(false)}
        />
      )}
    </div>
  )
}
