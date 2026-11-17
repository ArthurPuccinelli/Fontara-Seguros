'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import MaestroModal from '@/components/MaestroModal'
import WebFormJourney from '@/components/WebFormJourney'
import WhatsAppJourney from '@/components/WhatsAppJourney'
import EmbedShell from '@/components/EmbedShell'
import AgreementSearch from '@/components/AgreementSearch'

const DADOS_CADASTRAIS_WORKFLOW = '98e2f24c-e903-4692-b599-21fd8214e04e'

type Action = 'maestro' | 'resgate' | 'contratos' | 'whatsapp'

// Dados ilustrativos da carteira do cliente (não vêm da DocuSign).
const PRODUTOS = [
  {
    nome: 'Previdência Horizonte PGBL',
    numero: 'CERT-PGBL-2020-0031942',
    valor: 'R$ 48.312,77',
    legenda: 'saldo acumulado',
    extra: '+9,4% em 12 meses',
    acao: { label: 'Resgatar ou portar', action: 'resgate' as Action },
  },
  {
    nome: 'Vida Família',
    numero: 'APO-VIDA-2019-0007731',
    valor: 'R$ 250.000,00',
    legenda: 'capital segurado',
    extra: 'vigente até 03/2027',
    acao: { label: 'Ver contrato', action: 'contratos' as Action },
  },
]

const ATIVIDADE = [
  { quando: '12 nov', texto: 'Contribuição mensal de R$ 500,00 confirmada' },
  { quando: '03 nov', texto: 'Extrato de outubro disponível' },
  { quando: '21 out', texto: 'Beneficiários do Vida Família revisados' },
]

function saudacao(d: Date) {
  const h = d.getHours()
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}

export default function AreaClientePage() {
  const { user, ready, logout } = useAuth()
  const router = useRouter()
  const [modal, setModal] = useState<Action | null>(null)
  const [agora, setAgora] = useState<Date | null>(null)

  useEffect(() => {
    if (ready && !user) router.replace('/area-cliente/login')
  }, [ready, user, router])
  useEffect(() => setAgora(new Date()), [])

  if (!ready || !user) return null

  const primeiro = user.name.split(' ')[0]
  const iniciais = user.name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()

  return (
    <div className="min-h-screen bg-[#f6f5f1] text-gray-900">
      <header className="bg-fontara-navy">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center gap-8">
          <a href="/" className="shrink-0">
            <Image src="/logo.png" alt="Fontara Seguros" width={120} height={40} className="object-contain brightness-0 invert" priority />
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Área do cliente">
            <span className="text-white font-medium">Visão geral</span>
            <button onClick={() => setModal('contratos')} className="text-white/60 hover:text-white transition">Documentos</button>
            <Link href="/area-cliente/perfil" className="text-white/60 hover:text-white transition">Meus dados</Link>
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-2 text-sm text-white/80">
              <span className="w-8 h-8 rounded-full bg-white/10 text-white text-xs font-semibold flex items-center justify-center">{iniciais}</span>
              {primeiro}
            </span>
            <button
              onClick={() => {
                logout()
                router.push('/')
              }}
              className="text-sm text-white/60 hover:text-white transition"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-10 pb-16">
        <p className="text-xs uppercase tracking-[0.18em] text-gray-400" suppressHydrationWarning>
          {agora?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-fontara-navy mt-2">
          {agora ? saudacao(agora) : 'Olá'}, {primeiro}.
        </h1>

        <div className="grid lg:grid-cols-[1fr_320px] gap-10 mt-10">
          <div className="min-w-0">
            <section>
              <div className="flex items-baseline justify-between border-b border-gray-300 pb-2">
                <h2 className="text-sm font-semibold text-gray-700">Seus produtos</h2>
                <span className="text-xs text-gray-400">2 ativos</span>
              </div>
              <ul>
                {PRODUTOS.map((p) => (
                  <li key={p.numero} className="grid sm:grid-cols-[1fr_auto] gap-x-6 gap-y-3 py-6 border-b border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">{p.nome}</p>
                      <p className="text-xs text-gray-400 font-mono mt-1">{p.numero}</p>
                      <button
                        onClick={() => setModal(p.acao.action)}
                        className="mt-4 text-sm text-fontara-accent hover:text-fontara-navy underline underline-offset-4 decoration-fontara-accent/30"
                      >
                        {p.acao.label}
                      </button>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-2xl font-semibold tabular-nums tracking-tight text-fontara-navy">{p.valor}</p>
                      <p className="text-xs text-gray-500">{p.legenda}</p>
                      <p className="text-xs text-emerald-700 mt-1">{p.extra}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10 bg-white border border-gray-200 rounded-lg p-6 sm:p-8 grid sm:grid-cols-[1fr_auto] gap-6 items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#128C4A] font-semibold">Contratação pelo WhatsApp</p>
                <p className="text-xl font-semibold text-fontara-navy mt-2 tracking-tight max-w-md">
                  Escolha um plano aqui e assine a proposta no seu celular.
                </p>
                <p className="text-sm text-gray-500 mt-2 max-w-md">
                  Sem e-mail, sem papel. A proposta chega no WhatsApp de {user.phone || 'cadastro'} e é assinada em poucos toques.
                </p>
              </div>
              <button
                onClick={() => setModal('whatsapp')}
                className="inline-flex items-center gap-2 bg-fontara-navy text-white text-sm font-semibold px-5 py-3 rounded-md hover:bg-fontara-blue transition whitespace-nowrap"
              >
                Ver planos <ArrowUpRight size={15} />
              </button>
            </section>

            <section className="mt-10">
              <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-300 pb-2">Serviços</h2>
              <ul className="grid sm:grid-cols-2 gap-x-10">
                {[
                  { label: 'Atualizar dados cadastrais', onClick: () => setModal('maestro') },
                  { label: 'Resgate ou portabilidade', onClick: () => setModal('resgate') },
                  { label: 'Contratos e documentos', onClick: () => setModal('contratos') },
                  { label: 'Contratar novo plano', onClick: () => setModal('whatsapp') },
                ].map((s) => (
                  <li key={s.label} className="border-b border-gray-200">
                    <button onClick={s.onClick} className="w-full flex items-center justify-between py-4 text-sm text-gray-800 hover:text-fontara-navy group">
                      {s.label}
                      <ArrowUpRight size={15} className="text-gray-300 group-hover:text-fontara-navy transition" />
                    </button>
                  </li>
                ))}
                <li className="border-b border-gray-200 py-4 text-sm text-gray-400 flex justify-between">
                  Comunicar sinistro <span className="text-xs">em breve</span>
                </li>
              </ul>
            </section>
          </div>

          <aside className="space-y-10">
            <section>
              <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-300 pb-2">Pendências</h2>
              <div className="py-5 border-b border-gray-200">
                <p className="text-sm text-gray-800">Seu endereço e telefone não são confirmados desde 2023.</p>
                <button onClick={() => setModal('maestro')} className="mt-3 text-sm font-semibold text-fontara-navy hover:underline underline-offset-4">
                  Confirmar agora
                </button>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-300 pb-2">Atividade recente</h2>
              <ul>
                {ATIVIDADE.map((a) => (
                  <li key={a.texto} className="flex gap-4 py-3 border-b border-gray-200 text-sm">
                    <span className="w-12 shrink-0 text-xs text-gray-400 tabular-nums pt-0.5">{a.quando}</span>
                    <span className="text-gray-700">{a.texto}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="text-sm text-gray-500 leading-relaxed">
              <p className="text-gray-700 font-medium">Central de atendimento</p>
              <p className="tabular-nums">(11) 3000-0000 · seg. a sex., 8h às 18h</p>
              <Link href="/area-cliente/perfil" className="inline-block mt-4 text-xs text-gray-400 hover:text-gray-600">
                Dados usados na demonstração
              </Link>
            </section>
          </aside>
        </div>
      </main>

      {modal === 'maestro' && <MaestroModal workflowId={DADOS_CADASTRAIS_WORKFLOW} onClose={() => setModal(null)} />}

      {modal === 'resgate' && (
        <EmbedShell label="Resgate / Portabilidade" onClose={() => setModal(null)}>
          <WebFormJourney journey="resgate-portabilidade" title="Solicitação de Resgate / Portabilidade" />
        </EmbedShell>
      )}

      {modal === 'whatsapp' && (
        <EmbedShell label="Contratação pelo WhatsApp" onClose={() => setModal(null)}>
          <WhatsAppJourney origem="cliente" />
        </EmbedShell>
      )}

      {modal === 'contratos' && (
        <EmbedShell label="Contratos e documentos" onClose={() => setModal(null)}>
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-fontara-navy tracking-tight border-b border-gray-200 pb-4 mb-6">Contratos e documentos</h2>
            <AgreementSearch initialCpfCnpj={user.cpf} lockCpfCnpj />
          </div>
        </EmbedShell>
      )}
    </div>
  )
}
