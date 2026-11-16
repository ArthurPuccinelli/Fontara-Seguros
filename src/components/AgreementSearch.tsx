'use client'

import { useCallback, useEffect, useState } from 'react'
import { Search, Sparkles, Loader2, AlertTriangle, FlaskConical } from 'lucide-react'
import type { AgreementSummary, AgreementsResponse } from '@/types/demo'
import { formatCPF, formatCNPJ, formatBRL, onlyDigits } from '@/lib/br'

interface Props {
  initialCpfCnpj?: string
  initialExpiring?: number
  // oculta o campo de CPF/CNPJ (quando já filtrado pelo perfil)
  lockCpfCnpj?: boolean
}

function maskDoc(v: string) {
  return onlyDigits(v).length > 11 ? formatCNPJ(v) : formatCPF(v)
}

function daysUntil(iso?: string): number | null {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  return Math.ceil((d.getTime() - Date.now()) / 86400000)
}

function fmtDate(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR')
}

export default function AgreementSearch({ initialCpfCnpj = '', initialExpiring, lockCpfCnpj }: Props) {
  const [cpfCnpj, setCpfCnpj] = useState(maskDoc(initialCpfCnpj))
  const [q, setQ] = useState('')
  const [expiring, setExpiring] = useState<number | undefined>(initialExpiring)
  const [rows, setRows] = useState<AgreementSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [consentUrl, setConsentUrl] = useState('')
  const [demo, setDemo] = useState(false)

  const search = useCallback(
    async (opts?: { cpfCnpj?: string; q?: string; expiring?: number }) => {
      const c = opts?.cpfCnpj ?? cpfCnpj
      const text = opts?.q ?? q
      const exp = opts && 'expiring' in opts ? opts.expiring : expiring
      setLoading(true)
      setError('')
      setConsentUrl('')
      try {
        const params = new URLSearchParams()
        if (onlyDigits(c)) params.set('cpfCnpj', onlyDigits(c))
        if (exp) params.set('expiringInDays', String(exp))
        if (text.trim()) params.set('q', text.trim())
        const res = await fetch(`/api/docusign/agreements?${params.toString()}`)
        const data = (await res.json()) as AgreementsResponse & { consentUrl?: string }
        if (data.error) {
          setError(data.error)
          setConsentUrl(data.consentUrl ?? '')
          setRows([])
        } else {
          setRows(data.agreements ?? [])
          setDemo(!!data.demo)
        }
      } catch {
        setError('Erro de conexão ao buscar contratos.')
        setRows([])
      } finally {
        setLoading(false)
      }
    },
    [cpfCnpj, q, expiring]
  )

  useEffect(() => {
    search()
    // busca inicial apenas
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleExpiring(days: number) {
    const next = expiring === days ? undefined : days
    setExpiring(next)
    search({ expiring: next })
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          search()
        }}
        className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3"
      >
        <div className="grid sm:grid-cols-2 gap-3">
          {!lockCpfCnpj && (
            <div>
              <label htmlFor="ag-doc" className="block text-xs font-medium text-gray-600 mb-1">CPF / CNPJ</label>
              <input
                id="ag-doc"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(maskDoc(e.target.value))}
                placeholder="000.000.000-00"
                inputMode="numeric"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fontara-navy/30"
              />
            </div>
          )}
          <div className={lockCpfCnpj ? 'sm:col-span-2' : ''}>
            <label htmlFor="ag-q" className="block text-xs font-medium text-gray-600 mb-1">Busca livre</label>
            <input
              id="ag-q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ex.: VGBL, Padaria Bom Pão, apólice…"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fontara-navy/30"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleExpiring(d)}
              aria-pressed={expiring === d}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                expiring === d
                  ? 'bg-fontara-navy text-white border-fontara-navy'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-fontara-navy/40'
              }`}
            >
              Vence em {d} dias
            </button>
          ))}
          <button
            type="submit"
            className="ml-auto inline-flex items-center gap-2 bg-fontara-navy text-white text-sm px-4 py-2 rounded-lg hover:bg-fontara-navy/90 transition"
          >
            <Search size={15} /> Buscar
          </button>
        </div>
      </form>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium">
          <Sparkles size={12} /> Extraído por IA (Iris)
        </span>
        <span>Campos como partes, produto e vencimento são extraídos automaticamente dos documentos.</span>
        {demo && (
          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
            <FlaskConical size={12} /> dados de demonstração
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-sm">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div>
            {error}
            {consentUrl && (
              <>
                {' '}
                <a href={consentUrl} target="_blank" rel="noreferrer" className="underline font-semibold">
                  Conceder consentimento
                </a>
              </>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 font-medium">Contrato</th>
              <th className="px-4 py-3 font-medium">Partes</th>
              <th className="px-4 py-3 font-medium">CPF/CNPJ</th>
              <th className="px-4 py-3 font-medium">Produto</th>
              <th className="px-4 py-3 font-medium">Vencimento</th>
              <th className="px-4 py-3 font-medium text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  <Loader2 size={20} className="animate-spin inline mr-2" /> Buscando…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && !error && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">Nenhum contrato encontrado.</td>
              </tr>
            )}
            {!loading &&
              rows.map((a) => {
                const days = daysUntil(a.expirationDate)
                const soon = days !== null && days <= 90
                return (
                  <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-medium text-fontara-navy">
                      {a.title}
                      {a.type && <div className="text-[11px] text-gray-400 font-normal">{a.type}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.parties?.join(', ') || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{a.cpfCnpj ? maskDoc(a.cpfCnpj) : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{a.produto || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={soon ? 'bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-semibold' : 'text-gray-600'}>
                        {fmtDate(a.expirationDate)}
                      </span>
                      {soon && days !== null && (
                        <div className="text-[10px] text-amber-700 mt-0.5">{days < 0 ? 'vencido' : `em ${days} dias`}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 whitespace-nowrap">
                      {typeof a.value === 'number' ? formatBRL(a.value) : '—'}
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
