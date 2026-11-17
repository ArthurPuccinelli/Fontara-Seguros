'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { formatPhone, onlyDigits } from '@/lib/br'

// Contratação PF com entrega por WhatsApp: plano -> confirmar celular -> envelope (template PF) enviado
// com deliveryMethod WhatsApp -> acompanhamento do status por polling.

const PLANOS = [
  { id: 'vida', nome: 'Vida Essencial', produto: 'Seguro de Vida Individual', detalhe: 'Capital de R$ 200 mil · morte e invalidez', valor: 'R$ 39,90', periodicidade: 'Mensal' },
  { id: 'pgbl', nome: 'Previdência Horizonte PGBL', produto: 'Previdência PGBL', detalhe: 'Dedução de até 12% no IR · tabela regressiva', valor: 'R$ 500,00', periodicidade: 'Mensal' },
  { id: 'vgbl', nome: 'Reserva VGBL', produto: 'Previdência VGBL', detalhe: 'Para quem declara no modelo simplificado', valor: 'R$ 300,00', periodicidade: 'Mensal' },
] as const

type Fase = 'plano' | 'confirmar' | 'enviando' | 'enviado' | 'erro'

interface Status {
  status?: string
  signerStatus?: string
  demo?: boolean
}

const TRILHA = [
  { key: 'sent', label: 'Mensagem enviada ao WhatsApp' },
  { key: 'delivered', label: 'Cliente abriu o documento' },
  { key: 'completed', label: 'Proposta assinada' },
]

function etapa(s: Status): number {
  const v = (s.signerStatus || s.status || '').toLowerCase()
  if (v === 'completed' || v === 'signed' || s.status === 'completed') return 3
  if (v === 'delivered') return 2
  if (v === 'sent') return 1
  return 0
}

interface Props {
  /** cliente: o próprio titular contrata; canal: o vendedor envia ao celular do cliente */
  origem?: 'cliente' | 'canal'
}

export default function WhatsAppJourney({ origem = 'cliente' }: Props) {
  const { profile } = useAuth()
  const [fase, setFase] = useState<Fase>('plano')
  const [planoId, setPlanoId] = useState<string>('pgbl')
  const [phone, setPhone] = useState(profile.phone)
  const [beneficiario, setBeneficiario] = useState('')
  const [erro, setErro] = useState('')
  const [envelope, setEnvelope] = useState<{ id: string; numero: string; demo?: boolean } | null>(null)
  const [status, setStatus] = useState<Status>({})
  const timer = useRef<ReturnType<typeof setInterval>>()

  const plano = PLANOS.find((p) => p.id === planoId)!
  const phoneOk = onlyDigits(phone).replace(/^55(?=\d{10,11}$)/, '').length >= 10

  async function enviar() {
    setFase('enviando')
    setErro('')
    try {
      const r = await fetch('/api/docusign/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          phone,
          email: profile.email,
          cpf: profile.cpf,
          birthDate: profile.birthDate,
          address: profile.address,
          produto: plano.produto,
          valorContribuicao: plano.valor,
          periodicidade: plano.periodicidade,
          beneficiarios: beneficiario ? `${beneficiario} (100%)` : 'Herdeiros legais',
          canal: origem === 'canal' ? 'Portal do Canal (WhatsApp)' : 'Área do Cliente (WhatsApp)',
        }),
      })
      const d = await r.json()
      if (d.consentUrl) {
        window.location.href = d.consentUrl
        return
      }
      if (!r.ok || d.error) throw new Error(d.error || 'Não foi possível enviar a proposta.')
      setEnvelope({ id: d.envelopeId, numero: d.numeroProposta, demo: d.demo })
      setStatus({ status: 'sent', signerStatus: 'sent', demo: d.demo })
      setFase('enviado')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao enviar.')
      setFase('erro')
    }
  }

  useEffect(() => {
    if (!envelope) return
    const poll = async () => {
      try {
        const r = await fetch(`/api/docusign/whatsapp?envelopeId=${encodeURIComponent(envelope.id)}`)
        const d = await r.json()
        if (!d.error) setStatus(d)
        if (d.status === 'completed' && timer.current) clearInterval(timer.current)
      } catch {
        /* tenta de novo no próximo ciclo */
      }
    }
    timer.current = setInterval(poll, 5000)
    return () => clearInterval(timer.current)
  }, [envelope])

  const passo = fase === 'plano' ? 1 : fase === 'confirmar' || fase === 'erro' || fase === 'enviando' ? 2 : 3
  const atual = etapa(status)

  return (
    <div className="p-6 sm:p-10">
      <div className="flex items-baseline justify-between gap-4 border-b border-gray-200 pb-4 mb-8">
        <h2 className="text-xl font-semibold text-fontara-navy tracking-tight">
          {origem === 'canal' ? 'Nova contratação' : 'Contratar um plano'}
        </h2>
        <ol className="flex gap-4 text-xs text-gray-400 tabular-nums">
          {['Plano', 'Confirmação', 'Assinatura'].map((l, i) => (
            <li key={l} className={i + 1 === passo ? 'text-fontara-navy font-semibold' : i + 1 < passo ? 'text-gray-600' : ''}>
              {String(i + 1).padStart(2, '0')} {l}
            </li>
          ))}
        </ol>
      </div>

      {fase === 'plano' && (
        <>
          <fieldset>
            <legend className="text-sm text-gray-500 mb-3">Escolha o plano</legend>
            <div className="divide-y divide-gray-100 border-y border-gray-100">
              {PLANOS.map((p) => (
                <label key={p.id} className="flex items-center gap-4 py-4 cursor-pointer group">
                  <input type="radio" name="plano" value={p.id} checked={planoId === p.id} onChange={() => setPlanoId(p.id)} className="accent-fontara-navy w-4 h-4" />
                  <span className="flex-1 min-w-0">
                    <span className="block font-medium text-gray-900 group-hover:text-fontara-navy">{p.nome}</span>
                    <span className="block text-xs text-gray-500 mt-0.5">{p.detalhe}</span>
                  </span>
                  <span className="text-right tabular-nums">
                    <span className="block font-semibold text-gray-900">{p.valor}</span>
                    <span className="block text-[11px] text-gray-400">por mês</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block mt-6 max-w-sm">
            <span className="block text-sm text-gray-500">Beneficiário (opcional)</span>
            <input value={beneficiario} onChange={(e) => setBeneficiario(e.target.value)} placeholder="Nome completo" className="mt-1 w-full border-b border-gray-300 focus:border-fontara-navy outline-none py-2 text-sm bg-transparent" />
          </label>
          <div className="mt-10 flex justify-end">
            <button onClick={() => setFase('confirmar')} className="bg-fontara-navy text-white text-sm font-semibold px-6 py-3 rounded-md hover:bg-fontara-blue transition">
              Continuar
            </button>
          </div>
        </>
      )}

      {(fase === 'confirmar' || fase === 'erro' || fase === 'enviando') && (
        <div className="grid md:grid-cols-[1fr_260px] gap-10">
          <div>
            <dl className="text-sm divide-y divide-gray-100 border-y border-gray-100">
              {[
                ['Titular', profile.name],
                ['CPF', profile.cpf],
                ['Plano', plano.nome],
                ['Contribuição', `${plano.valor} · ${plano.periodicidade.toLowerCase()}`],
                ['Beneficiário', beneficiario || 'Herdeiros legais'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-3">
                  <dt className="text-gray-500">{k}</dt>
                  <dd className="text-gray-900 text-right">{v}</dd>
                </div>
              ))}
            </dl>
            <label className="block mt-6">
              <span className="block text-sm text-gray-500">{origem === 'canal' ? 'WhatsApp do cliente' : 'Enviar para o WhatsApp'}</span>
              <input value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} inputMode="tel" className="mt-1 w-full max-w-xs border-b border-gray-300 focus:border-fontara-navy outline-none py-2 text-lg tabular-nums bg-transparent" />
            </label>
            <p className="text-xs text-gray-400 mt-2 max-w-md">
              A proposta chega como mensagem da Docusign no WhatsApp deste número. Uma cópia vai para {profile.email}.
            </p>
            {fase === 'erro' && <p className="text-sm text-red-600 mt-4">{erro}</p>}
            <div className="mt-10 flex justify-between">
              <button onClick={() => setFase('plano')} className="text-sm text-gray-500 hover:text-fontara-navy">Voltar</button>
              <button
                onClick={enviar}
                disabled={!phoneOk || fase === 'enviando'}
                className="inline-flex items-center gap-2 bg-[#128C4A] text-white text-sm font-semibold px-6 py-3 rounded-md hover:bg-[#0f7a40] transition disabled:opacity-50"
              >
                {fase === 'enviando' && <Loader2 size={15} className="animate-spin" />}
                Enviar proposta pelo WhatsApp
              </button>
            </div>
          </div>
          <MensagemPreview nome={profile.name.split(' ')[0]} />
        </div>
      )}

      {fase === 'enviado' && envelope && (
        <div className="grid md:grid-cols-[1fr_260px] gap-10">
          <div>
            <p className="text-sm text-gray-500">Proposta <span className="tabular-nums text-gray-900 font-medium">{envelope.numero}</span></p>
            <p className="text-2xl font-semibold text-fontara-navy mt-1 tracking-tight">
              {atual >= 3 ? 'Assinada. Bem-vindo à Fontara.' : `Enviada para ${phone}`}
            </p>
            <ol className="mt-8 space-y-0">
              {TRILHA.map((t, i) => {
                const feito = atual > i
                const agora = !feito && i === atual
                return (
                  <li key={t.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${feito ? 'bg-fontara-navy border-fontara-navy text-white' : agora ? 'border-fontara-navy' : 'border-gray-300'}`}>
                        {feito ? <Check size={12} strokeWidth={3} /> : agora ? <span className="w-1.5 h-1.5 rounded-full bg-fontara-navy animate-pulse" /> : null}
                      </span>
                      {i < TRILHA.length - 1 && <span className={`w-px h-8 ${feito ? 'bg-fontara-navy' : 'bg-gray-200'}`} />}
                    </div>
                    <span className={`text-sm pt-0.5 ${feito ? 'text-gray-900' : 'text-gray-400'}`}>{t.label}</span>
                  </li>
                )
              })}
            </ol>
            <p className="text-xs text-gray-400 mt-6">
              Status atualizado a cada 5 s pela API do eSignature · envelope <span className="font-mono">{envelope.id.slice(0, 8)}</span>
              {envelope.demo && ' · simulação (modo demo)'}
            </p>
          </div>
          <MensagemPreview nome={profile.name.split(' ')[0]} enviado />
        </div>
      )}
    </div>
  )
}

function MensagemPreview({ nome, enviado }: { nome: string; enviado?: boolean }) {
  return (
    <div aria-hidden className="hidden md:block self-start rounded-[22px] border border-gray-200 bg-[#efeae2] p-3 shadow-sm">
      <div className="text-[10px] text-gray-500 text-center mb-2">WhatsApp · Docusign</div>
      <div className={`bg-white rounded-lg rounded-tl-none p-3 text-[12px] leading-snug text-gray-800 shadow-sm transition-opacity ${enviado ? 'opacity-100' : 'opacity-60'}`}>
        Olá, {nome}. A <b>Fontara Seguros</b> enviou a <b>Proposta de Adesão</b> para você revisar e assinar.
        <div className="mt-2 border-t border-gray-100 pt-2 text-center text-[#027eb5] font-medium">Revisar documento</div>
      </div>
      <div className="text-[10px] text-gray-400 text-right mt-1">{enviado ? 'entregue' : 'prévia'}</div>
    </div>
  )
}
