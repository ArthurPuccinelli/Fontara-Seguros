'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Check, RotateCcw, Info } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cloneDefaultProfile } from '@/lib/defaultProfile'
import { formatCNPJ, formatCPF, formatPhone } from '@/lib/br'
import type { DemoProfile, Pessoa } from '@/types/demo'

const CARGOS = ['Sócio-administrador', 'Diretor', 'Procurador']
const inputCls =
  'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fontara-navy/30 focus:border-fontara-navy transition bg-white'

function Field({ id, label, children, className = '' }: { id: string; label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}

export default function PerfilPage() {
  const { user, profile, ready, saveProfile, resetProfile, logout } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<DemoProfile>(profile)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (ready && !user) router.replace('/area-cliente/login')
  }, [ready, user, router])

  // sincroniza o formulário quando o perfil é carregado do localStorage
  useEffect(() => {
    if (ready) setForm(profile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2500)
    return () => clearTimeout(t)
  }, [toast])

  if (!ready || !user) return null

  const set = <K extends keyof DemoProfile>(k: K, v: DemoProfile[K]) => setForm((f) => ({ ...f, [k]: v }))
  const setPJ = (patch: Partial<DemoProfile['pj']>) => setForm((f) => ({ ...f, pj: { ...f.pj, ...patch } }))
  const updRep = (i: number, patch: Partial<Pessoa>) =>
    setPJ({ representantes: form.pj.representantes.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) })
  const updTest = (i: number, patch: Partial<Pessoa>) =>
    setPJ({ testemunhas: form.pj.testemunhas.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) })

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    saveProfile(form)
    setToast('Salvo no navegador')
  }

  function handleReset() {
    resetProfile()
    setForm(cloneDefaultProfile())
    setToast('Padrão restaurado')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-fontara-navy shadow-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/">
            <Image src="/logo.png" alt="Fontara Seguros" width={140} height={48} className="object-contain brightness-0 invert" priority />
          </a>
          <button
            onClick={() => {
              logout()
              router.push('/')
            }}
            className="text-white/70 hover:text-white text-sm transition"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/area-cliente" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-fontara-navy mb-4">
          <ArrowLeft size={15} /> Voltar
        </Link>
        <h1 className="text-2xl font-bold text-fontara-navy">Meus dados de demo</h1>
        <div className="flex items-start gap-2 mt-2 mb-6 text-sm text-fontara-navy bg-fontara-light border border-fontara-accent/20 rounded-lg px-4 py-3">
          <Info size={16} className="mt-0.5 shrink-0 text-fontara-accent" />
          <p>Estes dados ficam salvos apenas neste navegador e pré-preenchem todas as demos (e-mail/celular recebem a assinatura).</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-fontara-navy text-sm mb-4">Pessoa física</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field id="p-name" label="Nome completo">
                <input id="p-name" value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
              </Field>
              <Field id="p-cpf" label="CPF">
                <input id="p-cpf" value={form.cpf} onChange={(e) => set('cpf', formatCPF(e.target.value))} inputMode="numeric" className={inputCls} />
              </Field>
              <Field id="p-email" label="E-mail (recebe a assinatura)">
                <input id="p-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} />
              </Field>
              <Field id="p-phone" label="Celular (recebe a assinatura)">
                <input id="p-phone" value={form.phone} onChange={(e) => set('phone', formatPhone(e.target.value))} inputMode="tel" className={inputCls} />
              </Field>
              <Field id="p-birth" label="Data de nascimento">
                <input id="p-birth" type="date" value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} className={inputCls} />
              </Field>
              <Field id="p-addr" label="Endereço" className="sm:col-span-2">
                <input id="p-addr" value={form.address} onChange={(e) => set('address', e.target.value)} className={inputCls} />
              </Field>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-fontara-navy text-sm mb-4">Pessoa jurídica</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field id="pj-rs" label="Razão social">
                <input id="pj-rs" value={form.pj.razaoSocial} onChange={(e) => setPJ({ razaoSocial: e.target.value })} className={inputCls} />
              </Field>
              <Field id="pj-cnpj" label="CNPJ">
                <input id="pj-cnpj" value={form.pj.cnpj} onChange={(e) => setPJ({ cnpj: formatCNPJ(e.target.value) })} inputMode="numeric" className={inputCls} />
              </Field>
            </div>

            <div className="flex items-center justify-between mt-6 mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Representantes ({form.pj.representantes.length}/3)</h3>
              {form.pj.representantes.length < 3 && (
                <button
                  type="button"
                  onClick={() => setPJ({ representantes: [...form.pj.representantes, { nome: '', email: '', cpf: '', phone: '', cargo: CARGOS[0] }] })}
                  className="inline-flex items-center gap-1 text-xs text-fontara-accent font-semibold hover:underline"
                >
                  <Plus size={14} /> Adicionar
                </button>
              )}
            </div>
            <div className="space-y-4">
              {form.pj.representantes.map((r, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-gray-500">Representante {i + 1}</span>
                    {form.pj.representantes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPJ({ representantes: form.pj.representantes.filter((_, idx) => idx !== i) })}
                        className="text-gray-400 hover:text-red-500"
                        aria-label={`Remover representante ${i + 1}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field id={`r${i}-n`} label="Nome">
                      <input id={`r${i}-n`} value={r.nome} onChange={(e) => updRep(i, { nome: e.target.value })} className={inputCls} />
                    </Field>
                    <Field id={`r${i}-c`} label="Cargo">
                      <select id={`r${i}-c`} value={r.cargo ?? CARGOS[0]} onChange={(e) => updRep(i, { cargo: e.target.value })} className={inputCls}>
                        {CARGOS.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                    <Field id={`r${i}-cpf`} label="CPF">
                      <input id={`r${i}-cpf`} value={r.cpf ?? ''} onChange={(e) => updRep(i, { cpf: formatCPF(e.target.value) })} inputMode="numeric" className={inputCls} />
                    </Field>
                    <Field id={`r${i}-ph`} label="Celular">
                      <input id={`r${i}-ph`} value={r.phone ?? ''} onChange={(e) => updRep(i, { phone: formatPhone(e.target.value) })} inputMode="tel" className={inputCls} />
                    </Field>
                    <Field id={`r${i}-e`} label="E-mail" className="sm:col-span-2">
                      <input id={`r${i}-e`} type="email" value={r.email} onChange={(e) => updRep(i, { email: e.target.value })} className={inputCls} />
                    </Field>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6 mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Testemunhas ({form.pj.testemunhas.length}/2)</h3>
              {form.pj.testemunhas.length < 2 && (
                <button
                  type="button"
                  onClick={() => setPJ({ testemunhas: [...form.pj.testemunhas, { nome: '', email: '' }] })}
                  className="inline-flex items-center gap-1 text-xs text-fontara-accent font-semibold hover:underline"
                >
                  <Plus size={14} /> Adicionar
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {form.pj.testemunhas.map((t, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500">Testemunha {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => setPJ({ testemunhas: form.pj.testemunhas.filter((_, idx) => idx !== i) })}
                      className="text-gray-400 hover:text-red-500"
                      aria-label={`Remover testemunha ${i + 1}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <Field id={`t${i}-n`} label="Nome">
                    <input id={`t${i}-n`} value={t.nome} onChange={(e) => updTest(i, { nome: e.target.value })} className={inputCls} />
                  </Field>
                  <Field id={`t${i}-e`} label="E-mail">
                    <input id={`t${i}-e`} type="email" value={t.email} onChange={(e) => updTest(i, { email: e.target.value })} className={inputCls} />
                  </Field>
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="inline-flex items-center gap-2 bg-fontara-navy text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-fontara-navy/90 transition">
              <Check size={16} /> Salvar
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 text-sm px-5 py-3 rounded-lg hover:bg-white transition"
            >
              <RotateCcw size={15} /> Restaurar padrão
            </button>
          </div>
        </form>
      </main>

      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-fontara-navy text-white text-sm px-5 py-3 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
