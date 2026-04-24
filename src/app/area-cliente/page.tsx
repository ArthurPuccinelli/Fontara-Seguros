'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { User, FileText, Shield, AlertTriangle, LogOut, ChevronRight, Phone } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import MaestroModal from '@/components/MaestroModal'

const DADOS_CADASTRAIS_WORKFLOW = '98e2f24c-e903-4692-b599-21fd8214e04e'

const menuItems = [
  {
    icon: User,
    title: 'Alterar Dados Cadastrais',
    description: 'Atualize suas informações pessoais e de contato',
    color: 'bg-blue-50 text-blue-600',
    maestro: true,
  },
  {
    icon: Shield,
    title: 'Meus Seguros',
    description: 'Visualize as apólices ativas e coberturas contratadas',
    href: '#',
    color: 'bg-green-50 text-green-600',
    soon: true,
  },
  {
    icon: AlertTriangle,
    title: 'Sinistros',
    description: 'Abra e acompanhe ocorrências e acionamentos',
    href: '#',
    color: 'bg-amber-50 text-amber-600',
    soon: true,
  },
  {
    icon: FileText,
    title: 'Documentos',
    description: 'Acesse apólices, boletos e comprovantes',
    href: '#',
    color: 'bg-purple-50 text-purple-600',
    soon: true,
  },
]

export default function AreaClientePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (!user) router.replace('/area-cliente/login')
  }, [user, router])

  if (!user) return null

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

            if (item.maestro) {
              return (
                <button
                  key={item.title}
                  onClick={() => setModalOpen(true)}
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

      {modalOpen && (
        <MaestroModal
          workflowId={DADOS_CADASTRAIS_WORKFLOW}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
