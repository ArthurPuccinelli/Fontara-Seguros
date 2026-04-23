'use client'

import { useState } from 'react'
import { FileSignature, Send, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react'

type Seguro = 'vida' | 'auto' | 'residencial' | 'empresarial' | 'saude' | 'viagem'

interface FormData {
  nome: string
  email: string
  cpf: string
  telefone: string
  tipoSeguro: Seguro | ''
  valorCoberturaDesejado: string
  observacoes: string
}

const tiposSeguro = [
  { value: 'vida', label: 'Seguro de Vida' },
  { value: 'auto', label: 'Seguro Auto' },
  { value: 'residencial', label: 'Seguro Residencial' },
  { value: 'empresarial', label: 'Seguro Empresarial' },
  { value: 'saude', label: 'Seguro Saúde' },
  { value: 'viagem', label: 'Seguro Viagem' },
]

function formatCPF(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function formatPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let check = 11 - (sum % 11)
  if (check >= 10) check = 0
  if (check !== parseInt(digits[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  check = 11 - (sum % 11)
  if (check >= 10) check = 0
  return check === parseInt(digits[10])
}

type Status = 'idle' | 'loading' | 'success' | 'error'

interface DocuSignResult {
  envelopeId?: string
  signingUrl?: string
  message?: string
}

export default function CotacaoForm() {
  const [form, setForm] = useState<FormData>({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    tipoSeguro: '',
    valorCoberturaDesejado: '',
    observacoes: '',
  })
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<DocuSignResult | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  function validate() {
    const e: Partial<FormData> = {}
    if (!form.nome.trim()) e.nome = 'Nome é obrigatório'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'E-mail inválido'
    if (!validateCPF(form.cpf)) e.cpf = 'CPF inválido'
    if (form.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Telefone inválido'
    if (!form.tipoSeguro) e.tipoSeguro = 'Selecione um tipo de seguro' as Seguro
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setStatus('loading')

    try {
      const res = await fetch('/api/docusign/envelope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signerName: form.nome,
          signerEmail: form.email,
          cpf: form.cpf,
          phone: form.telefone,
          tipoSeguro: form.tipoSeguro,
          valorCobertura: form.valorCoberturaDesejado,
          observacoes: form.observacoes,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult(data)
        setStatus('success')
        setShowModal(true)
      } else {
        setResult({ message: data.error || 'Erro ao processar a solicitação' })
        setStatus('error')
        setShowModal(true)
      }
    } catch {
      setResult({ message: 'Erro de conexão. Tente novamente.' })
      setStatus('error')
      setShowModal(true)
    }
  }

  return (
    <section id="cotacao" className="py-24 bg-fontara-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left info */}
          <div>
            <span className="inline-block text-fontara-accent font-semibold text-sm uppercase tracking-widest mb-3">
              Cotação Gratuita
            </span>
            <h2 className="section-heading mb-4">
              Solicite sua proposta{' '}
              <span className="text-fontara-accent">agora mesmo</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              Preencha o formulário ao lado e nossa equipe preparará uma proposta personalizada.
              Após aprovação, você assina digitalmente via{' '}
              <strong className="text-fontara-navy">DocuSign</strong> — sem papelada, sem burocracia.
            </p>

            {/* DocuSign badge */}
            <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <FileSignature className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="font-bold text-fontara-navy mb-1">Assinatura Digital via DocuSign</p>
                <p className="text-gray-500 text-sm">
                  Após receber sua proposta, assine eletronicamente com validade jurídica.
                  100% seguro, rápido e sem precisar sair de casa.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                { label: 'Cotação em', value: '2 minutos' },
                { label: 'Apólice em', value: '24 horas' },
                { label: 'Suporte', value: '24h / 7 dias' },
                { label: 'Sem custo', value: 'Cotação grátis' },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl p-4 shadow-card">
                  <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                  <p className="font-bold text-fontara-navy">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-card p-8 space-y-5">
            <h3 className="text-xl font-bold text-fontara-navy mb-6">Seus dados</h3>

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome completo *</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Seu nome completo"
                className={`w-full border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fontara-accent transition ${
                  errors.nome ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
            </div>

            {/* Email + CPF */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="seu@email.com"
                  className={`w-full border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fontara-accent transition ${
                    errors.email ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">CPF *</label>
                <input
                  type="text"
                  value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: formatCPF(e.target.value) })}
                  placeholder="000.000.000-00"
                  className={`w-full border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fontara-accent transition ${
                    errors.cpf ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>}
              </div>
            </div>

            {/* Telefone + Tipo Seguro */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone *</label>
                <input
                  type="text"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: formatPhone(e.target.value) })}
                  placeholder="(11) 99999-9999"
                  className={`w-full border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fontara-accent transition ${
                    errors.telefone ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de Seguro *</label>
                <select
                  value={form.tipoSeguro}
                  onChange={(e) => setForm({ ...form, tipoSeguro: e.target.value as Seguro })}
                  className={`w-full border rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-fontara-accent transition ${
                    errors.tipoSeguro ? 'border-red-400' : 'border-gray-200'
                  }`}
                >
                  <option value="">Selecione...</option>
                  {tiposSeguro.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {errors.tipoSeguro && <p className="text-red-500 text-xs mt-1">{errors.tipoSeguro}</p>}
              </div>
            </div>

            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Valor de cobertura desejado (opcional)
              </label>
              <input
                type="text"
                value={form.valorCoberturaDesejado}
                onChange={(e) => setForm({ ...form, valorCoberturaDesejado: e.target.value })}
                placeholder="Ex: R$ 500.000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fontara-accent transition"
              />
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Observações (opcional)</label>
              <textarea
                rows={3}
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                placeholder="Informações adicionais sobre sua necessidade..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fontara-accent transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-base"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Solicitar Cotação + Assinatura Digital
                </>
              )}
            </button>

            <p className="text-center text-gray-400 text-xs">
              Ao enviar, você concorda com nossa{' '}
              <a href="#" className="text-fontara-accent hover:underline">Política de Privacidade</a>.
            </p>
          </form>
        </div>
      </div>

      {/* Result Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-fade-up">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            {status === 'success' ? (
              <>
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-green-500" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-fontara-navy text-center mb-2">
                  Solicitação enviada!
                </h3>
                <p className="text-gray-500 text-center mb-6">
                  Sua proposta foi gerada com sucesso. Verifique seu e-mail para assinar o documento via DocuSign.
                </p>
                {result?.envelopeId && (
                  <div className="bg-gray-50 rounded-xl p-4 text-sm mb-4">
                    <p className="text-gray-500">ID do envelope DocuSign:</p>
                    <p className="font-mono font-bold text-fontara-navy break-all">{result.envelopeId}</p>
                  </div>
                )}
                {result?.signingUrl && (
                  <a
                    href={result.signingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block btn-primary text-center"
                  >
                    <FileSignature size={18} className="inline mr-2" />
                    Assinar agora via DocuSign
                  </a>
                )}
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="text-red-500" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-fontara-navy text-center mb-2">Ops!</h3>
                <p className="text-gray-500 text-center mb-6">
                  {result?.message || 'Ocorreu um erro. Tente novamente.'}
                </p>
                <button
                  onClick={() => { setShowModal(false); setStatus('idle') }}
                  className="w-full btn-primary text-center"
                >
                  Tentar novamente
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
