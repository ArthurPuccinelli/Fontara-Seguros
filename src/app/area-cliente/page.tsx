'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { User, FileText, AlertTriangle, LogOut, ChevronRight, Phone, UserCog, ArrowRightLeft, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import MaestroModal from '@/components/MaestroModal'
import WebFormJourney from '@/components/WebFormJourney'
import EmbedShell from '@/components/EmbedShell'
import AgreementSearch from '@/components/AgreementSearch'

const DADOS_CADASTRAIS_WORKFLOW = '98e2f24c-e903-4692-b599-21fd8214e04e'

type Action = 'maestro' | 'resgate' | 'contratos'

const menuItems: {
  icon: typeof User
  title: string
  description: string
  color: string
  href?: string
  action?: Action
  soon?: boolean
}[] = [
  {
    icon: UserCog,
    title: 'Meus dados de demo',
    description: 'Configure os dados que pré-preenchem todas as demos',
    color: 'bg-fontara-light text-fontara-accent',
    href: '/area-cliente/perfil',
  },
  {
    icon: User,
    title: 'Alterar Dados Cadastrais',
    description: 'Atualize suas informações pessoais e de contato',
    color: 'bg-blue-50 text-blue-600',
    action: 'maestro',
  },
  {
    icon: ArrowRightLeft,
    title: 'Resgate / Portabilidade',
    description: 'Solicite resgate ou portabilidade do seu plano de previdência',
    color: 'bg-green-50 text-green-600',
    action: 'resgate',
  },
  {
    icon: FileText,
    title: 'Meus contratos',
    description: 'Consulte seus contratos e vencimentos',
    color: 'bg-purple-50 text-purple-600',
    action: 'contratos',
  },
  {
    icon: AlertTriangle,
    title: 'Sinistros',
    description: 'Abra e acompanhe ocorrências e acionamentos',
    href: '#',
    color: 'bg-amber-50 text-amber-600',
    soon: true,
  },
]

export default function AreaClientePage() {
  const { user, ready, logout } = useAuth()
  const router = useRouter()
  const [modal, setModal] = useState<Action | null>(null)

  useEffect(() => {
    if (ready && !user) router.replace('/area-cliente/login')
  }, [ready, user, router])

  if (!ready || !user) return null

  function handleLogout() {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-fontara-navy shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/">
            <Image src="/logo.png" alt="Fontara Seguros" width={140} height={48} className="object-contain brightness-0 invert" priority />
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-fontara-navy">
            Olá, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 text-sm mt-1">O que você precisa hoje?</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {menuItems.map((item) => {
            const Icon = item.icon

            if (item.action) {
              return (
                <button
                  key={item.title}
                  onClick={() => setModal(item.action!)}
                  className="relative bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 group transition hover:shadow-md text-left w-full"
                >
                  <div className={`p-3 rounded-lg ${item.color} shrink-0`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-fontara-navy text-sm">{item.title}</h2>
                    <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{item.description}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-fontara-navy transition shrink-0 mt-1" />
                </button>
              )
            }

            return (
              <Link
                key={item.title}
                href={item.href!}
                className={`relative bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 group transition hover:shadow-md ${item.soon ? 'opacity-60 pointer-events-none' : ''}`}
              >
                <div className={`p-3 rounded-lg ${item.color} shrink-0`}>
                  <Icon size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-fontara-navy text-sm">{item.title}</h2>
                    {item.soon && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Em breve</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{item.description}</p>
                </div>
                {!item.soon && (
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-fontara-navy transition shrink-0 mt-1" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Help banner */}
        <div className="bg-fontara-navy/5 border border-fontara-navy/10 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div>
            <h3 className="font-semibold text-fontara-navy text-sm">Precisa de ajuda?</h3>
            <p className="text-gray-500 text-xs mt-0.5">Nossa equipe está disponível de seg. a sex., das 8h às 18h.</p>
          </div>
          <a
            href="tel:+551130000000"
            className="flex items-center gap-2 bg-fontara-navy text-white text-sm px-4 py-2 rounded-lg hover:bg-fontara-navy/90 transition shrink-0"
          >
            <Phone size={15} />
            (11) 3000-0000
          </a>
        </div>
      </main>

      {modal === 'maestro' && (
        <MaestroModal workflowId={DADOS_CADASTRAIS_WORKFLOW} onClose={() => setModal(null)} />
      )}

      {modal === 'resgate' && (
        <EmbedShell label="Resgate / Portabilidade" onClose={() => setModal(null)}>
          <WebFormJourney journey="resgate-portabilidade" title="Solicitação de Resgate / Portabilidade" />
        </EmbedShell>
      )}

      {modal === 'contratos' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModal(null)}
              className="absolute top-4 right-4 z-10 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
            <div className="px-6 py-4 border-b border-gray-100 pr-14">
              <h2 className="text-lg font-bold text-fontara-navy">
                Meus contratos
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <AgreementSearch initialCpfCnpj={user.cpf} lockCpfCnpj />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
