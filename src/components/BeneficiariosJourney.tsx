'use client'

import { useState } from 'react'
import { Check, Loader2, Plus, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import SigningEmbed from './SigningEmbed'

// Alteração de beneficiários (C5): formulário do portal -> modelo de envelope ligado ao Modelo de documento
// da biblioteca (cláusulas condicionais por Produto e por beneficiário menor) -> assinatura embarcada.

const PARENTESCOS = ['cônjuge', 'companheiro(a)', 'filho(a)', 'pai/mãe', 'irmão(ã)', 'outro']

interface Linha {
  nome: string
  parentesco: string
  percentual: string
  menor: boolean
}

interface Props {
  produto: 'Vida' | 'Previdência'
  certificado: string
  nomePlano: string
}

type Fase = 'form' | 'enviando' | 'assinando' | 'assinado' | 'erro'

const vazia = (): Linha => ({ nome: '', parentesco: 'filho(a)', percentual: '', menor: false })

export default function BeneficiariosJourney({ produto, certificado, nomePlano }: Props) {
  const { profile } = useAuth()
  const [linhas, setLinhas] = useState<Linha[]>([
    { nome: 'Maria Silva', parentesco: 'cônjuge', percentual: '50', menor: false },
    { nome: 'Lucas Silva', parentesco: 'filho(a)', percentual: '50', menor: true },
  ])
  const [fase, setFase] = useState<Fase>('form')
  const [erro, setErro] = useState('')
  const [env, setEnv] = useState<{ envelopeId: string; clientUserId: string; protocolo: string; demo?: boolean } | null>(null)

  const preenchidas = linhas.filter((l) => l.nome.trim())
  const soma = preenchidas.reduce((s, l) => s + (Number(l.percentual) || 0), 0)
  const valido = preenchidas.length > 0 && soma === 100

  const set = (i: number, patch: Partial<Linha>) => setLinhas((ls) => ls.map((l, k) => (k === i ? { ...l, ...patch } : l)))

  async function enviar() {
    setFase('enviando')
    setErro('')
    try {
      const r = await fetch('/api/docusign/beneficiarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signerName: profile.name,
          signerEmail: profile.email,
          cpf: profile.cpf,
          certificado,
          produto,
          beneficiarios: preenchidas.map((l) => ({ ...l, percentual: Number(l.percentual) })),
        }),
      })
      const d = await r.json()
      if (d.consentUrl) {
        window.location.href = d.consentUrl
        return
      }
      if (!r.ok || d.error) throw new Error(d.error || 'Não foi possível gerar o documento.')
      setEnv(d)
      setFase(d.demo ? 'assinado' : 'assinando')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao gerar o documento.')
      setFase('erro')
    }
  }

  if (fase === 'assinando' && env) {
    return (
      <div className="h-full">
        <SigningEmbed
          envelopeId={env.envelopeId}
          name={profile.name}
          email={profile.email}
          clientUserId={env.clientUserId}
          onFinished={() => setFase('assinado')}
        />
      </div>
    )
  }

  if (fase === 'assinado') {
    return (
      <div className="p-8 sm:p-12 max-w-xl">
        <span className="w-10 h-10 rounded-full bg-fontara-navy text-white flex items-center justify-center mb-6">
          <Check size={20} strokeWidth={3} />
        </span>
        <h2 className="text-2xl font-semibold text-fontara-navy tracking-tight">Beneficiários atualizados.</h2>
        <p className="text-sm text-gray-500 mt-2">
          Protocolo <span className="tabular-nums text-gray-900 font-medium">{env?.protocolo}</span> · {nomePlano}
          {env?.demo && ' · simulação (modo demo)'}
        </p>
        <p className="text-sm text-gray-500 mt-4 leading-relaxed">
          O termo assinado fica disponível em Documentos. A nova indicação passa a valer a partir de hoje.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-10">
      <div className="flex items-baseline justify-between gap-4 border-b border-gray-200 pb-4 mb-8">
        <div>
          <h2 className="text-xl font-semibold text-fontara-navy tracking-tight">Alterar beneficiários</h2>
          <p className="text-xs text-gray-500 mt-1">
            {nomePlano} · <span className="font-mono">{certificado}</span>
          </p>
        </div>
        <span className={`text-sm tabular-nums ${soma === 100 ? 'text-emerald-700' : 'text-amber-700'}`}>{soma}% de 100%</span>
      </div>

      <div className="divide-y divide-gray-100 border-y border-gray-100">
        {linhas.map((l, i) => (
          <div key={i} className="grid grid-cols-12 gap-3 items-end py-4">
            <label className="col-span-12 sm:col-span-5">
              <span className="block text-xs text-gray-500">Nome completo</span>
              <input value={l.nome} onChange={(e) => set(i, { nome: e.target.value })} className="mt-1 w-full border-b border-gray-300 focus:border-fontara-navy outline-none py-1.5 text-sm bg-transparent" />
            </label>
            <label className="col-span-5 sm:col-span-3">
              <span className="block text-xs text-gray-500">Parentesco</span>
              <select value={l.parentesco} onChange={(e) => set(i, { parentesco: e.target.value })} className="mt-1 w-full border-b border-gray-300 focus:border-fontara-navy outline-none py-1.5 text-sm bg-transparent">
                {PARENTESCOS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </label>
            <label className="col-span-3 sm:col-span-1">
              <span className="block text-xs text-gray-500">%</span>
              <input value={l.percentual} inputMode="numeric" onChange={(e) => set(i, { percentual: e.target.value.replace(/\D/g, '').slice(0, 3) })} className="mt-1 w-full border-b border-gray-300 focus:border-fontara-navy outline-none py-1.5 text-sm tabular-nums bg-transparent" />
            </label>
            <label className="col-span-3 sm:col-span-2 flex items-center gap-2 text-xs text-gray-600 pb-2">
              <input type="checkbox" checked={l.menor} onChange={(e) => set(i, { menor: e.target.checked })} className="accent-fontara-navy" />
              Menor de idade
            </label>
            <div className="col-span-1 flex justify-end pb-1.5">
              {linhas.length > 1 && (
                <button onClick={() => setLinhas((ls) => ls.filter((_, k) => k !== i))} aria-label="Remover beneficiário" className="text-gray-300 hover:text-red-600">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {linhas.length < 6 && (
        <button onClick={() => setLinhas((ls) => [...ls, vazia()])} className="mt-4 inline-flex items-center gap-1.5 text-sm text-fontara-accent hover:text-fontara-navy">
          <Plus size={15} /> Adicionar beneficiário
        </button>
      )}

      <p className="text-xs text-gray-400 mt-6 max-w-lg leading-relaxed">
        O termo é gerado a partir do modelo de documento da Fontara: a tabela cresce com o número de beneficiários e as cláusulas mudam conforme o plano
        ({produto === 'Vida' ? 'seguro de vida' : 'previdência'}) e a indicação de menor de idade.
      </p>
      {fase === 'erro' && <p className="text-sm text-red-600 mt-4">{erro}</p>}

      <div className="mt-8 flex justify-end">
        <button
          onClick={enviar}
          disabled={!valido || fase === 'enviando'}
          className="inline-flex items-center gap-2 bg-fontara-navy text-white text-sm font-semibold px-6 py-3 rounded-md hover:bg-fontara-blue transition disabled:opacity-40"
        >
          {fase === 'enviando' && <Loader2 size={15} className="animate-spin" />}
          Gerar termo e assinar
        </button>
      </div>
    </div>
  )
}
