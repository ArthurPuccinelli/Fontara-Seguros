'use client'

import Link from 'next/link'
import { ArrowRight, FileStack, Zap, Layers, Plus } from 'lucide-react'
import { JOURNEYS } from '@/lib/journeys'
import type { JourneyMode } from '@/types/demo'

const MODE_LABEL: Record<JourneyMode, string> = {
  api: 'Formulário do portal (API)',
  'embedded-workflow': 'Experiência embarcada (Workflow)',
  'embedded-webform': 'Web Form embarcado',
}

const KPIS = [
  { icon: FileStack, label: 'POPs digitalizados', value: '3', hint: 'de 38 mapeados' },
  { icon: Zap, label: 'Jornadas ativas', value: String(JOURNEYS.length), hint: 'no catálogo' },
  { icon: Layers, label: 'Assinaturas este mês', value: '1.284', hint: 'dados de demonstração' },
]

export default function CanalHome() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-fontara-navy">Catálogo de jornadas</h1>
        <p className="text-gray-500 text-sm mt-1">Escolha o POP digital que deseja iniciar para o seu cliente.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {KPIS.map((k) => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-fontara-light text-fontara-accent">
              <k.icon size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold text-fontara-navy leading-none">{k.value}</div>
              <div className="text-xs text-gray-600 mt-1">{k.label}</div>
              <div className="text-[10px] text-gray-400">{k.hint}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {JOURNEYS.map((j) => (
          <Link
            key={j.slug}
            href={`/canal/nova-jornada/${j.slug}`}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-semibold bg-fontara-gold/15 text-amber-800 px-2 py-1 rounded-full">
                substitui {j.popCode}
              </span>
              <div className="flex gap-1">
                {j.publico.map((p) => (
                  <span key={p} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{p}</span>
                ))}
              </div>
            </div>
            <h2 className="font-semibold text-fontara-navy mb-1">{j.title}</h2>
            <p className="text-gray-500 text-xs leading-relaxed mb-4 flex-1">{j.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {j.produtos.map((p) => (
                <span key={p} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{p}</span>
              ))}
            </div>
            <div className="text-[11px] text-gray-400 mb-3">{j.modes.map((m) => MODE_LABEL[m]).join(' · ')}</div>
            <span className="text-sm font-semibold text-fontara-accent flex items-center gap-1 group-hover:gap-2 transition-all">
              Iniciar jornada <ArrowRight size={15} />
            </span>
          </Link>
        ))}

        <div className="rounded-xl border-2 border-dashed border-gray-200 p-5 flex flex-col items-center justify-center text-center text-gray-400">
          <Plus size={24} className="mb-2" />
          <p className="text-sm font-medium text-gray-500">Novo POP = nova entrada no catálogo</p>
          <p className="text-xs mt-1">Aponte para um workflow ou Web Form do DocuSign — sem desenvolver uma nova tela.</p>
        </div>
      </div>
    </div>
  )
}
