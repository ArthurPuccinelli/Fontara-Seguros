'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, ChevronDown, ChevronRight, Loader2, Plus, Trash2, UserCheck, AlertTriangle, FileText, Send, Eye } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  formatCNPJ,
  formatCPF,
  formatPhone,
  isValidEmail,
  maskCurrency,
  parseCurrency,
  onlyDigits,
} from '@/lib/br'
import type { MaestroTriggerResponse, TriggerInputValue } from '@/types/demo'

export type TipoPessoa = 'PF' | 'PJ'
export const CARGOS = ['Sócio-administrador', 'Diretor', 'Procurador'] as const
export const PRODUTOS = [
  { value: 'VGBL', label: 'VGBL', only: undefined },
  { value: 'PGBL', label: 'PGBL', only: undefined },
  { value: 'Seguro de Vida em Grupo', label: 'Seguro de Vida em Grupo', only: 'PJ' },
  { value: 'Seguro de Vida Individual', label: 'Seguro de Vida Individual', only: 'PF' },
] as const
export const PERIODICIDADES = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'anual', label: 'Anual' },
  { value: 'aporte-unico', label: 'Aporte único' },
]
export const CANAIS = ['Agência Caixa', 'Parceiro', 'Corretor']
export const PARENTESCOS = ['Cônjuge', 'Filho(a)', 'Pai/Mãe', 'Irmão(ã)', 'Outro']

export interface RepState {
  nome: string
  cpf: string
  email: string
  celular: string
  cargo: string
}
export interface TestemunhaState {
  nome: string
  email: string
}
export interface BeneficiarioState {
  nome: string
  parentesco: string
  percentual: string
}
export interface JourneyFormState {
  tipoPessoa: TipoPessoa
  nome: string
  cpf: string
  email: string
  celular: string
  nascimento: string
  razaoSocial: string
  cnpj: string
  representantes: RepState[]
  exigeTestemunhas: boolean
  testemunhas: TestemunhaState[]
  produto: string
  valor: string
  periodicidade: string
  beneficiarios: BeneficiarioState[]
  canal: string
}

const emptyRep = (): RepState => ({ nome: '', cpf: '', email: '', celular: '', cargo: CARGOS[0] })

export function emptyFormState(): JourneyFormState {
  return {
    tipoPessoa: 'PF',
    nome: '',
    cpf: '',
    email: '',
    celular: '',
    nascimento: '',
    razaoSocial: '',
    cnpj: '',
    representantes: [emptyRep()],
    exigeTestemunhas: false,
    testemunhas: [
      { nome: '', email: '' },
      { nome: '', email: '' },
    ],
    produto: '',
    valor: '',
    periodicidade: 'mensal',
    beneficiarios: [{ nome: '', parentesco: PARENTESCOS[0], percentual: '100' }],
    canal: CANAIS[0],
  }
}

// Monta o mapa FLAT de inputs enviado ao Workflow Builder (campos vazios para o que não se aplica).
export function buildProposalInputs(f: JourneyFormState, vendedorEmail: string): Record<string, TriggerInputValue> {
  const pj = f.tipoPessoa === 'PJ'
  const reps = pj ? f.representantes : []
  const inputs: Record<string, TriggerInputValue> = {
    tipoPessoa: f.tipoPessoa,
    nomeTitular: pj ? f.razaoSocial : f.nome,
    cpfCnpj: pj ? f.cnpj : f.cpf,
    emailTitular: pj ? reps[0]?.email ?? '' : f.email,
    celularTitular: pj ? reps[0]?.celular ?? '' : f.celular,
    razaoSocial: pj ? f.razaoSocial : '',
    produto: f.produto,
    valorContribuicao: f.valor,
    periodicidade: f.periodicidade,
    canal: f.canal,
    qtdRepresentantes: reps.length,
    numeroProposta: `FS-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    dataProposta: new Date().toLocaleDateString('pt-BR'),
  }
  for (let i = 1; i <= 3; i++) {
    const r = reps[i - 1]
    inputs[`rep${i}Nome`] = r?.nome ?? ''
    inputs[`rep${i}Email`] = r?.email ?? ''
    inputs[`rep${i}Cpf`] = r?.cpf ?? ''
    inputs[`rep${i}Celular`] = r?.celular ?? ''
    inputs[`rep${i}Cargo`] = r?.cargo ?? ''
  }
  const test = pj && f.exigeTestemunhas
  inputs.exigeTestemunhas = test ? 'sim' : 'nao'
  for (let i = 1; i <= 2; i++) {
    inputs[`test${i}Nome`] = test ? f.testemunhas[i - 1]?.nome ?? '' : ''
    inputs[`test${i}Email`] = test ? f.testemunhas[i - 1]?.email ?? '' : ''
  }
  inputs.beneficiarios =
    f.tipoPessoa === 'PF'
      ? f.beneficiarios.map((b) => `${b.nome} (${b.parentesco}) ${b.percentual}%`).join('; ')
      : ''
  inputs.vendedorEmail = vendedorEmail
  return inputs
}

type Errors = Record<string, string>

export function validateForm(f: JourneyFormState): Errors {
  const e: Errors = {}
  const pj = f.tipoPessoa === 'PJ'
  if (!pj) {
    if (f.nome.trim().length < 3) e.nome = 'Informe o nome completo'
    if (!onlyDigits(f.cpf)) e.cpf = 'Informe o CPF'
    if (!isValidEmail(f.email)) e.email = 'E-mail inválido'
    if (onlyDigits(f.celular).length < 10) e.celular = 'Celular inválido'
    if (!f.nascimento) e.nascimento = 'Informe a data de nascimento'
  } else {
    if (f.razaoSocial.trim().length < 3) e.razaoSocial = 'Informe a razão social'
    if (!onlyDigits(f.cnpj)) e.cnpj = 'Informe o CNPJ'
    f.representantes.forEach((r, i) => {
      if (r.nome.trim().length < 3) e[`rep${i}Nome`] = 'Informe o nome'
      if (!onlyDigits(r.cpf)) e[`rep${i}Cpf`] = 'Informe o CPF'
      if (!isValidEmail(r.email)) e[`rep${i}Email`] = 'E-mail inválido'
      if (onlyDigits(r.celular).length < 10) e[`rep${i}Celular`] = 'Celular inválido'
    })
    if (f.exigeTestemunhas) {
      f.testemunhas.forEach((t, i) => {
        if (t.nome.trim().length < 3) e[`test${i}Nome`] = 'Informe o nome'
        if (!isValidEmail(t.email)) e[`test${i}Email`] = 'E-mail inválido'
      })
    }
  }
  if (!f.produto) e.produto = 'Selecione o produto'
  if (parseCurrency(f.valor) <= 0) e.valor = 'Informe o valor da contribuição'
  if (!pj) {
    if (f.beneficiarios.length === 0) {
      e.beneficiarios = 'Informe ao menos um beneficiário'
    } else {
      f.beneficiarios.forEach((b, i) => {
        if (b.nome.trim().length < 3) e[`ben${i}Nome`] = 'Informe o nome'
      })
      const sum = f.beneficiarios.reduce((a, b) => a + (Number(b.percentual) || 0), 0)
      if (sum !== 100) e.beneficiarios = `Os percentuais devem somar 100% (atual: ${sum}%)`
    }
  }
  return e
}

const inputCls =
  'w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fontara-navy/30 focus:border-fontara-navy transition bg-white'

function Field({ label, error, children, htmlFor }: { label: string; error?: string; children: React.ReactNode; htmlFor: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function TextInput({
  id,
  value,
  onChange,
  error,
  ...rest
}: { id: string; value: string; onChange: (v: string) => void; error?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'id'>) {
  return (
    <input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputCls} ${error ? 'border-red-300' : 'border-gray-200'}`}
      aria-invalid={!!error}
      {...rest}
    />
  )
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-fontara-navy text-sm">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

interface Props {
  journey?: string
}

export default function JourneyForm({ journey = 'proposta' }: Props) {
  const { profile, sessionEmail } = useAuth()
  const [f, setF] = useState<JourneyFormState>(emptyFormState)
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ data: MaestroTriggerResponse & { consentUrl?: string }; payload: unknown; inputs: Record<string, TriggerInputValue> } | null>(null)
  const [showPayload, setShowPayload] = useState(false)
  const [netError, setNetError] = useState('')

  const pj = f.tipoPessoa === 'PJ'
  const produtos = PRODUTOS.filter((p) => !p.only || p.only === f.tipoPessoa)
  const set = <K extends keyof JourneyFormState>(k: K, v: JourneyFormState[K]) => setF((s) => ({ ...s, [k]: v }))

  function setTipo(t: TipoPessoa) {
    setF((s) => {
      const prodOk = PRODUTOS.some((p) => p.value === s.produto && (!p.only || p.only === t))
      return { ...s, tipoPessoa: t, produto: prodOk ? s.produto : '' }
    })
    setErrors({})
  }

  function usarClienteDemo() {
    setF((s) => ({
      ...s,
      nome: profile.name,
      cpf: profile.cpf,
      email: profile.email,
      celular: profile.phone,
      nascimento: profile.birthDate,
      razaoSocial: profile.pj.razaoSocial,
      cnpj: profile.pj.cnpj,
      representantes: profile.pj.representantes.slice(0, 3).map((r) => ({
        nome: r.nome,
        cpf: r.cpf ?? '',
        email: r.email,
        celular: r.phone ?? '',
        cargo: r.cargo && (CARGOS as readonly string[]).includes(r.cargo) ? r.cargo : CARGOS[0],
      })),
      testemunhas: [0, 1].map((i) => ({
        nome: profile.pj.testemunhas[i]?.nome ?? '',
        email: profile.pj.testemunhas[i]?.email ?? '',
      })),
      exigeTestemunhas: s.tipoPessoa === 'PJ' ? profile.pj.testemunhas.length > 0 : s.exigeTestemunhas,
    }))
    setErrors({})
  }

  function updRep(i: number, patch: Partial<RepState>) {
    setF((s) => ({ ...s, representantes: s.representantes.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) }))
  }
  function updBen(i: number, patch: Partial<BeneficiarioState>) {
    setF((s) => ({ ...s, beneficiarios: s.beneficiarios.map((b, idx) => (idx === i ? { ...b, ...patch } : b)) }))
  }

  const benSum = useMemo(() => f.beneficiarios.reduce((a, b) => a + (Number(b.percentual) || 0), 0), [f.beneficiarios])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validateForm(f)
    setErrors(errs)
    if (Object.keys(errs).length) return
    const inputs = buildProposalInputs(f, sessionEmail ?? '')
    const payload = { journey, mode: 'api', inputs }
    setSubmitting(true)
    setNetError('')
    try {
      const res = await fetch('/api/docusign/maestro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as MaestroTriggerResponse & { consentUrl?: string }
      if (data.error) {
        setNetError(data.error)
      }
      setResult({ data, payload, inputs })
    } catch {
      setNetError('Erro de conexão. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  // ---- Resultado ----
  if (result && !result.data.error) {
    const signatarios: { nome: string; papel: string }[] = pj
      ? [
          ...f.representantes.map((r) => ({ nome: r.nome, papel: r.cargo })),
          ...(f.exigeTestemunhas ? f.testemunhas.map((t) => ({ nome: t.nome, papel: 'Testemunha' })) : []),
        ]
      : [{ nome: f.nome, papel: 'Titular' }]
    return (
      <div className="space-y-4">
        <div className="bg-white border border-green-100 rounded-xl shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle size={26} className="text-green-500" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-fontara-navy text-lg">Proposta enviada!</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Instância do workflow:{' '}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs break-all">{result.data.instanceId ?? '—'}</code>
                {result.data.demo && (
                  <span className="ml-2 text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">demonstração</span>
                )}
              </p>
            </div>
          </div>

          <ol className="mt-6 space-y-4 border-l-2 border-green-200 ml-6 pl-6">
            <li className="relative">
              <span className="absolute -left-[34px] top-0.5 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center"><FileText size={11} /></span>
              <p className="text-sm font-semibold text-fontara-navy">Documento gerado</p>
              <p className="text-xs text-gray-500">Proposta de adesão preenchida automaticamente (Doc Gen).</p>
            </li>
            <li className="relative">
              <span className="absolute -left-[34px] top-0.5 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center"><Send size={11} /></span>
              <p className="text-sm font-semibold text-fontara-navy">
                Enviado para assinatura ({signatarios.length} {signatarios.length === 1 ? 'signatário' : 'signatários'})
              </p>
              <ul className="text-xs text-gray-600 mt-1 space-y-0.5">
                {signatarios.map((s, i) => (
                  <li key={i}>
                    <UserCheck size={11} className="inline mr-1 text-gray-400" />
                    {s.nome} <span className="text-gray-400">— {s.papel}</span>
                  </li>
                ))}
              </ul>
            </li>
            <li className="relative">
              <span className="absolute -left-[34px] top-0.5 w-5 h-5 rounded-full bg-fontara-accent text-white flex items-center justify-center"><Eye size={11} /></span>
              <p className="text-sm font-semibold text-fontara-navy">Acompanhe em tempo real</p>
              <Link href="/canal/acompanhamento" className="text-xs text-fontara-accent font-semibold hover:underline">
                /canal/acompanhamento →
              </Link>
            </li>
          </ol>
        </div>

        <PayloadPanel payload={result.payload} open={showPayload} onToggle={() => setShowPayload((v) => !v)} />

        <button
          onClick={() => {
            setResult(null)
            setShowPayload(false)
          }}
          className="text-sm text-fontara-accent font-semibold hover:underline"
        >
          Nova proposta
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1" role="group" aria-label="Tipo de pessoa">
          {(['PF', 'PJ'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              aria-pressed={f.tipoPessoa === t}
              className={`px-4 py-1.5 text-sm rounded-md transition ${f.tipoPessoa === t ? 'bg-fontara-navy text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {t === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={usarClienteDemo}
          className="inline-flex items-center gap-2 text-sm border border-fontara-accent/30 text-fontara-accent px-3 py-2 rounded-lg hover:bg-fontara-light transition"
        >
          <UserCheck size={15} /> Usar cliente de demo
        </button>
      </div>

      {!pj ? (
        <Section title="Dados do titular">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nome completo" htmlFor="pf-nome" error={errors.nome}>
              <TextInput id="pf-nome" value={f.nome} onChange={(v) => set('nome', v)} error={errors.nome} autoComplete="off" />
            </Field>
            <Field label="CPF" htmlFor="pf-cpf" error={errors.cpf}>
              <TextInput id="pf-cpf" value={f.cpf} onChange={(v) => set('cpf', formatCPF(v))} error={errors.cpf} inputMode="numeric" placeholder="000.000.000-00" />
            </Field>
            <Field label="E-mail (recebe a assinatura)" htmlFor="pf-email" error={errors.email}>
              <TextInput id="pf-email" type="email" value={f.email} onChange={(v) => set('email', v)} error={errors.email} />
            </Field>
            <Field label="Celular" htmlFor="pf-cel" error={errors.celular}>
              <TextInput id="pf-cel" value={f.celular} onChange={(v) => set('celular', formatPhone(v))} error={errors.celular} inputMode="tel" placeholder="(11) 99999-9999" />
            </Field>
            <Field label="Data de nascimento" htmlFor="pf-nasc" error={errors.nascimento}>
              <TextInput id="pf-nasc" type="date" value={f.nascimento} onChange={(v) => set('nascimento', v)} error={errors.nascimento} />
            </Field>
          </div>
        </Section>
      ) : (
        <>
          <Section title="Dados da empresa">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Razão social" htmlFor="pj-rs" error={errors.razaoSocial}>
                <TextInput id="pj-rs" value={f.razaoSocial} onChange={(v) => set('razaoSocial', v)} error={errors.razaoSocial} />
              </Field>
              <Field label="CNPJ" htmlFor="pj-cnpj" error={errors.cnpj}>
                <TextInput id="pj-cnpj" value={f.cnpj} onChange={(v) => set('cnpj', formatCNPJ(v))} error={errors.cnpj} inputMode="numeric" placeholder="00.000.000/0000-00" />
              </Field>
            </div>
          </Section>

          <Section
            title={`Representantes legais / sócios / procurador (${f.representantes.length}/3)`}
            action={
              f.representantes.length < 3 && (
                <button
                  type="button"
                  onClick={() => set('representantes', [...f.representantes, emptyRep()])}
                  className="inline-flex items-center gap-1 text-xs text-fontara-accent font-semibold hover:underline"
                >
                  <Plus size={14} /> Adicionar
                </button>
              )
            }
          >
            <div className="space-y-5">
              {f.representantes.map((r, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500">Signatário {i + 1}</span>
                    {f.representantes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => set('representantes', f.representantes.filter((_, idx) => idx !== i))}
                        className="text-gray-400 hover:text-red-500"
                        aria-label={`Remover signatário ${i + 1}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Nome" htmlFor={`rep${i}-nome`} error={errors[`rep${i}Nome`]}>
                      <TextInput id={`rep${i}-nome`} value={r.nome} onChange={(v) => updRep(i, { nome: v })} error={errors[`rep${i}Nome`]} />
                    </Field>
                    <Field label="Cargo" htmlFor={`rep${i}-cargo`}>
                      <select id={`rep${i}-cargo`} value={r.cargo} onChange={(e) => updRep(i, { cargo: e.target.value })} className={`${inputCls} border-gray-200`}>
                        {CARGOS.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="CPF" htmlFor={`rep${i}-cpf`} error={errors[`rep${i}Cpf`]}>
                      <TextInput id={`rep${i}-cpf`} value={r.cpf} onChange={(v) => updRep(i, { cpf: formatCPF(v) })} error={errors[`rep${i}Cpf`]} inputMode="numeric" />
                    </Field>
                    <Field label="Celular" htmlFor={`rep${i}-cel`} error={errors[`rep${i}Celular`]}>
                      <TextInput id={`rep${i}-cel`} value={r.celular} onChange={(v) => updRep(i, { celular: formatPhone(v) })} error={errors[`rep${i}Celular`]} inputMode="tel" />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="E-mail" htmlFor={`rep${i}-email`} error={errors[`rep${i}Email`]}>
                        <TextInput id={`rep${i}-email`} type="email" value={r.email} onChange={(v) => updRep(i, { email: v })} error={errors[`rep${i}Email`]} />
                      </Field>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <label className="flex items-center gap-2 mt-5 text-sm text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={f.exigeTestemunhas}
                onChange={(e) => set('exigeTestemunhas', e.target.checked)}
                className="rounded border-gray-300 text-fontara-navy focus:ring-fontara-navy"
              />
              Exige testemunhas
            </label>
            {f.exigeTestemunhas && (
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                {f.testemunhas.map((t, i) => (
                  <div key={i} className="space-y-3 border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                    <span className="text-xs font-semibold text-gray-500">Testemunha {i + 1}</span>
                    <Field label="Nome" htmlFor={`t${i}-nome`} error={errors[`test${i}Nome`]}>
                      <TextInput
                        id={`t${i}-nome`}
                        value={t.nome}
                        onChange={(v) => set('testemunhas', f.testemunhas.map((x, idx) => (idx === i ? { ...x, nome: v } : x)))}
                        error={errors[`test${i}Nome`]}
                      />
                    </Field>
                    <Field label="E-mail" htmlFor={`t${i}-email`} error={errors[`test${i}Email`]}>
                      <TextInput
                        id={`t${i}-email`}
                        type="email"
                        value={t.email}
                        onChange={(v) => set('testemunhas', f.testemunhas.map((x, idx) => (idx === i ? { ...x, email: v } : x)))}
                        error={errors[`test${i}Email`]}
                      />
                    </Field>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </>
      )}

      <Section title="Produto e contribuição">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Produto" htmlFor="produto" error={errors.produto}>
            <select
              id="produto"
              value={f.produto}
              onChange={(e) => set('produto', e.target.value)}
              className={`${inputCls} ${errors.produto ? 'border-red-300' : 'border-gray-200'}`}
            >
              <option value="">Selecione…</option>
              {produtos.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Valor da contribuição (R$)" htmlFor="valor" error={errors.valor}>
            <TextInput id="valor" value={f.valor} onChange={(v) => set('valor', maskCurrency(v))} error={errors.valor} inputMode="numeric" placeholder="0,00" />
          </Field>
          <Field label="Periodicidade" htmlFor="periodicidade">
            <select id="periodicidade" value={f.periodicidade} onChange={(e) => set('periodicidade', e.target.value)} className={`${inputCls} border-gray-200`}>
              {PERIODICIDADES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Canal" htmlFor="canal">
            <select id="canal" value={f.canal} onChange={(e) => set('canal', e.target.value)} className={`${inputCls} border-gray-200`}>
              {CANAIS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {!pj && (
        <Section
          title="Beneficiários"
          action={
            <button
              type="button"
              onClick={() => set('beneficiarios', [...f.beneficiarios, { nome: '', parentesco: PARENTESCOS[0], percentual: '0' }])}
              className="inline-flex items-center gap-1 text-xs text-fontara-accent font-semibold hover:underline"
            >
              <Plus size={14} /> Adicionar
            </button>
          }
        >
          <div className="space-y-3">
            {f.beneficiarios.map((b, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto] sm:grid-cols-[2fr_1.2fr_90px_auto] gap-3 items-end">
                <Field label="Nome" htmlFor={`b${i}-nome`} error={errors[`ben${i}Nome`]}>
                  <TextInput id={`b${i}-nome`} value={b.nome} onChange={(v) => updBen(i, { nome: v })} error={errors[`ben${i}Nome`]} />
                </Field>
                <div className="hidden sm:block">
                  <Field label="Parentesco" htmlFor={`b${i}-par`}>
                    <select id={`b${i}-par`} value={b.parentesco} onChange={(e) => updBen(i, { parentesco: e.target.value })} className={`${inputCls} border-gray-200`}>
                      {PARENTESCOS.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="hidden sm:block">
                  <Field label="%" htmlFor={`b${i}-pct`}>
                    <TextInput id={`b${i}-pct`} type="number" min={0} max={100} value={b.percentual} onChange={(v) => updBen(i, { percentual: v })} />
                  </Field>
                </div>
                <button
                  type="button"
                  onClick={() => set('beneficiarios', f.beneficiarios.filter((_, idx) => idx !== i))}
                  className="p-2.5 text-gray-400 hover:text-red-500"
                  aria-label={`Remover beneficiário ${i + 1}`}
                >
                  <Trash2 size={15} />
                </button>
                {/* mobile: parentesco e % em linha própria */}
                <div className="sm:hidden col-span-2 grid grid-cols-[1fr_90px] gap-3">
                  <select aria-label="Parentesco" value={b.parentesco} onChange={(e) => updBen(i, { parentesco: e.target.value })} className={`${inputCls} border-gray-200`}>
                    {PARENTESCOS.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                  <input aria-label="Percentual" type="number" min={0} max={100} value={b.percentual} onChange={(e) => updBen(i, { percentual: e.target.value })} className={`${inputCls} border-gray-200`} />
                </div>
              </div>
            ))}
          </div>
          <p className={`text-xs mt-3 ${benSum === 100 ? 'text-green-600' : 'text-gray-500'}`}>Total: {benSum}% {benSum !== 100 && '(deve somar 100%)'}</p>
          {errors.beneficiarios && <p className="text-xs text-red-500 mt-1">{errors.beneficiarios}</p>}
        </Section>
      )}

      {(netError || (result?.data.error ?? '')) && (
        <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-sm" role="alert">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div>
            {netError}
            {result?.data.consentUrl && (
              <>
                {' '}
                <a href={result.data.consentUrl} target="_blank" rel="noreferrer" className="underline font-semibold">
                  Conceder consentimento no DocuSign
                </a>
              </>
            )}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-fontara-navy text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-fontara-navy/90 transition disabled:opacity-60"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {submitting ? 'Enviando…' : 'Enviar proposta para assinatura'}
      </button>
    </form>
  )
}

function PayloadPanel({ payload, open, onToggle }: { payload: unknown; open: boolean; onToggle: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <button type="button" onClick={onToggle} aria-expanded={open} className="w-full flex items-center gap-2 px-5 py-3 text-sm font-semibold text-fontara-navy">
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        Ver payload enviado à API
        <span className="text-[11px] font-normal text-gray-400 ml-auto">POST /api/docusign/maestro</span>
      </button>
      {open && (
        <pre className="px-5 pb-5 text-xs text-gray-700 overflow-x-auto bg-gray-50 border-t border-gray-100 pt-4 rounded-b-xl">
          {JSON.stringify(payload, null, 2)}
        </pre>
      )}
    </div>
  )
}
