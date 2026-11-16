'use client'

import { Check, X, Loader2 } from 'lucide-react'

interface Props {
  status: string
  currentStep?: string
  startedAt?: string
  endedAt?: string
  // rótulos das 3 etapas: início, andamento, fim
  labels?: [string, string, string]
}

type Kind = 'done' | 'active' | 'failed'

export function normalizeStatus(status: string): { kind: Kind; label: string } {
  const s = (status || '').toLowerCase().replace(/[\s_-]/g, '')
  if (s === 'completed' || s === 'signed' || s === 'concluido') return { kind: 'done', label: 'Concluído' }
  if (s === 'canceled' || s === 'cancelled' || s === 'voided') return { kind: 'failed', label: 'Cancelado' }
  if (s === 'failed') return { kind: 'failed', label: 'Falhou' }
  if (s === 'declined') return { kind: 'failed', label: 'Recusado' }
  if (s === 'created') return { kind: 'active', label: 'Criado' }
  if (s === 'sent') return { kind: 'active', label: 'Enviado' }
  if (s === 'delivered') return { kind: 'active', label: 'Visualizado' }
  return { kind: 'active', label: 'Em andamento' }
}

export function formatDateTime(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function StatusBadge({ status }: { status: string }) {
  const { kind, label } = normalizeStatus(status)
  const cls =
    kind === 'done'
      ? 'bg-green-50 text-green-700'
      : kind === 'failed'
      ? 'bg-red-50 text-red-700'
      : 'bg-blue-50 text-blue-700'
  return <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
}

export default function StatusTimeline({ status, currentStep, startedAt, endedAt, labels }: Props) {
  const { kind } = normalizeStatus(status)
  const [l1, l2, l3] = labels ?? ['Iniciado', currentStep || 'Em andamento', kind === 'failed' ? 'Encerrado' : 'Concluído']

  const steps: { label: string; state: 'done' | 'active' | 'failed' | 'todo'; sub?: string }[] = [
    { label: l1, state: 'done', sub: formatDateTime(startedAt) },
    {
      label: l2,
      state: kind === 'active' ? 'active' : 'done',
    },
    {
      label: l3,
      state: kind === 'done' ? 'done' : kind === 'failed' ? 'failed' : 'todo',
      sub: kind !== 'active' ? formatDateTime(endedAt) : undefined,
    },
  ]

  return (
    <ol className="flex items-start gap-0 w-full min-w-[220px]" aria-label={`Status: ${status}`}>
      {steps.map((st, i) => (
        <li key={i} className="flex-1 flex flex-col items-center text-center relative">
          {i > 0 && (
            <span
              className={`absolute top-3 right-1/2 w-full h-0.5 -z-0 ${
                st.state === 'todo' ? 'bg-gray-200' : st.state === 'failed' ? 'bg-red-300' : 'bg-green-300'
              }`}
              aria-hidden
            />
          )}
          <span
            className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-white ${
              st.state === 'done' ? 'bg-green-500' : st.state === 'active' ? 'bg-fontara-accent' : st.state === 'failed' ? 'bg-red-500' : 'bg-gray-200'
            }`}
          >
            {st.state === 'done' && <Check size={14} />}
            {st.state === 'active' && <Loader2 size={14} className="animate-spin" />}
            {st.state === 'failed' && <X size={14} />}
          </span>
          <span className="text-[11px] mt-1 font-medium text-gray-700 leading-tight px-1 break-words max-w-[110px]">{st.label}</span>
          {st.sub && <span className="text-[10px] text-gray-400">{st.sub}</span>}
        </li>
      ))}
    </ol>
  )
}
