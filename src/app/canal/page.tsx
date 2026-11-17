'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { JOURNEYS } from '@/lib/journeys'
import { useAuth } from '@/context/AuthContext'
import type { InstanceSummary, JourneyMode } from '@/types/demo'

const MODE_LABEL: Record<JourneyMode, string> = {
  api: 'Formulário do portal',
  'embedded-workflow': 'Docusign embarcado',
  'embedded-webform': 'Web Form embarcado',
  whatsapp: 'Envio por WhatsApp',
}

const NUMEROS = [
  { valor: '4', legenda: 'POPs digitalizados', nota: 'de 38 mapeados' },
  { valor: '1.284', legenda: 'assinaturas no mês', nota: 'ilustrativo' },
  { valor: '1h52', legenda: 'tempo médio até assinar', nota: 'antes: 6 dias' },
]

export default function CanalHome() {
  const { profile } = useAuth()
  const [recentes, setRecentes] = useState<InstanceSummary[] | null>(null)

  useEffect(() => {
    fetch('/api/docusign/maestro/instances')
      .then((r) => r.json())
      .then((d) => setRecentes((d.instances ?? []).slice(0, 5)))
      .catch(() => setRecentes([]))
  }, [])

  return (
    <div>
      <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-end border-b border-gray-300 pb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Cliente em atendimento</p>
          <p className="text-3xl font-semibold tracking-tight text-fontara-navy mt-2">{profile.name}</p>
          <p className="text-sm text-gray-500 mt-1 tabular-nums">
            {profile.cpf} · {profile.phone} · PJ {profile.pj.razaoSocial}
            <Link href="/area-cliente/perfil" className="ml-3 text-fontara-accent hover:underline underline-offset-4">trocar</Link>
          </p>
        </div>
        <dl className="flex gap-10">
          {NUMEROS.map((n) => (
            <div key={n.legenda}>
              <dt className="sr-only">{n.legenda}</dt>
              <dd className="text-2xl font-semibold tabular-nums text-fontara-navy">{n.valor}</dd>
              <dd className="text-xs text-gray-600">{n.legenda}</dd>
              <dd className="text-[11px] text-gray-400">{n.nota}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-10 mt-10">
        <section className="min-w-0">
          <div className="flex items-baseline justify-between mb-2">
            <h1 className="text-sm font-semibold text-gray-700">Iniciar jornada</h1>
            <span className="text-xs text-gray-400">{JOURNEYS.length} no catálogo</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-200">
                <tr>
                  <th className="font-medium px-5 py-3 w-28">POP</th>
                  <th className="font-medium px-5 py-3">Jornada</th>
                  <th className="font-medium px-5 py-3 hidden md:table-cell">Como roda</th>
                  <th className="px-5 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {JOURNEYS.map((j) => (
                  <tr key={j.slug} className="group hover:bg-[#faf9f6]">
                    <td className="px-5 py-4 align-top font-mono text-xs text-gray-500 whitespace-nowrap">{j.popCode}</td>
                    <td className="px-5 py-4 align-top">
                      <Link href={`/canal/nova-jornada/${j.slug}`} className="font-medium text-gray-900 group-hover:text-fontara-navy">
                        {j.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1 max-w-md leading-relaxed">{j.description}</p>
                      <p className="text-[11px] text-gray-400 mt-2">{j.publico.join(' / ')} · {j.produtos.join(', ')}</p>
                    </td>
                    <td className="px-5 py-4 align-top text-xs text-gray-600 hidden md:table-cell whitespace-nowrap">
                      {j.modes.map((m) => <div key={m}>{MODE_LABEL[m]}</div>)}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <Link href={`/canal/nova-jornada/${j.slug}`} aria-label={`Iniciar ${j.title}`} className="text-gray-300 group-hover:text-fontara-navy transition">
                        <ArrowRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Um novo POP entra aqui como uma linha de configuração apontando para um workflow ou Web Form, sem tela nova.
          </p>
        </section>

        <aside>
          <div className="flex items-baseline justify-between border-b border-gray-300 pb-2">
            <h2 className="text-sm font-semibold text-gray-700">Em andamento</h2>
            <Link href="/canal/acompanhamento" className="text-xs text-fontara-accent hover:underline underline-offset-4">ver tudo</Link>
          </div>
          {recentes === null && <p className="text-sm text-gray-400 py-4">Carregando…</p>}
          {recentes?.length === 0 && <p className="text-sm text-gray-400 py-4">Nenhuma jornada recente.</p>}
          <ul>
            {recentes?.map((i) => (
              <li key={i.id} className="py-3 border-b border-gray-200">
                <p className="text-sm text-gray-800 truncate">{i.workflowName || i.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 flex justify-between gap-2">
                  <span className="truncate">{i.currentStep || i.name}</span>
                  <span className={i.status.toLowerCase().includes('complet') ? 'text-emerald-700' : 'text-amber-700'}>{i.status}</span>
                </p>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}
