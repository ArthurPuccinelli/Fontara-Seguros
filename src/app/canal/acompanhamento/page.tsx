'use client'

import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, AlertTriangle, FlaskConical } from 'lucide-react'
import StatusTimeline, { StatusBadge, formatDateTime } from '@/components/StatusTimeline'
import type { EnvelopesResponse, EnvelopeSummary, InstancesResponse, InstanceSummary } from '@/types/demo'

type Tab = 'instancias' | 'envelopes'
const REFRESH_MS = 15000

export default function AcompanhamentoPage() {
  const [tab, setTab] = useState<Tab>('instancias')
  const [instances, setInstances] = useState<InstanceSummary[]>([])
  const [envelopes, setEnvelopes] = useState<EnvelopeSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [consentUrl, setConsentUrl] = useState('')
  const [demo, setDemo] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (tab === 'instancias') {
        const r = await fetch('/api/docusign/maestro/instances')
        const d = (await r.json()) as InstancesResponse & { consentUrl?: string }
        if (d.error) {
          setError(d.error)
          setConsentUrl(d.consentUrl ?? '')
        } else {
          setError('')
          setConsentUrl('')
          setInstances(d.instances ?? [])
          setDemo(!!d.demo)
        }
      } else {
        const r = await fetch('/api/docusign/envelopes?days=7')
        const d = (await r.json()) as EnvelopesResponse & { consentUrl?: string }
        if (d.error) {
          setError(d.error)
          setConsentUrl(d.consentUrl ?? '')
        } else {
          setError('')
          setConsentUrl('')
          setEnvelopes(d.envelopes ?? [])
          setDemo(!!d.demo)
        }
      }
      setUpdatedAt(new Date())
    } catch {
      setError('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    load()
    const t = setInterval(load, REFRESH_MS)
    return () => clearInterval(t)
  }, [load])

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-fontara-navy">Acompanhamento</h1>
          <p className="text-gray-500 text-sm mt-1">Status em tempo real das jornadas e assinaturas. Atualiza a cada 15 segundos.</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {demo && (
            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
              <FlaskConical size={12} /> dados de demonstração
            </span>
          )}
          {updatedAt && <span>Atualizado às {updatedAt.toLocaleTimeString('pt-BR')}</span>}
          <button onClick={load} className="inline-flex items-center gap-1 text-fontara-accent font-semibold hover:underline" aria-label="Atualizar agora">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Atualizar
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-5" role="tablist">
        {([
          ['instancias', 'Instâncias (Workflow Builder)'],
          ['envelopes', 'Envelopes'],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => {
              setTab(k)
              setError('')
            }}
            className={`px-4 py-2.5 text-sm border-b-2 -mb-px transition ${
              tab === k ? 'border-fontara-accent text-fontara-accent font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-sm mb-4">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div>
            {error}
            {consentUrl && (
              <>
                {' '}
                <a href={consentUrl} target="_blank" rel="noreferrer" className="underline font-semibold">Conceder consentimento</a>
              </>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tab === 'instancias' &&
          instances.map((i) => (
            <div key={i.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 grid md:grid-cols-[1fr_320px] gap-4 items-center">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold text-fontara-navy text-sm">{i.name}</h2>
                  <StatusBadge status={i.status} />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {i.workflowName ?? i.workflowId}
                  {i.startedBy ? ` · ${i.startedBy}` : ''}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5 break-all">
                  {i.id}
                  {i.startedAt ? ` · iniciado ${formatDateTime(i.startedAt)}` : ''}
                </p>
              </div>
              <StatusTimeline status={i.status} currentStep={i.currentStep} startedAt={i.startedAt} endedAt={i.endedAt} />
            </div>
          ))}

        {tab === 'envelopes' &&
          envelopes.map((e) => (
            <div key={e.envelopeId} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 grid md:grid-cols-[1fr_320px] gap-4 items-center">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold text-fontara-navy text-sm">{e.subject}</h2>
                  <StatusBadge status={e.status} />
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 break-all">{e.envelopeId}</p>
                {e.recipients && e.recipients.length > 0 && (
                  <ul className="mt-2 text-xs text-gray-600 space-y-0.5">
                    {e.recipients.map((r, idx) => (
                      <li key={idx}>
                        {r.name} <span className="text-gray-400">{r.role ? `(${r.role}) ` : ''}— {r.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <StatusTimeline
                status={e.status}
                startedAt={e.sentAt}
                endedAt={e.completedAt}
                labels={['Enviado', 'Aguardando assinaturas', 'Concluído']}
              />
            </div>
          ))}

        {!loading &&
          ((tab === 'instancias' && instances.length === 0) || (tab === 'envelopes' && envelopes.length === 0)) &&
          !error && <p className="text-center text-gray-400 py-12 text-sm">Nada por aqui ainda.</p>}
      </div>
    </div>
  )
}
