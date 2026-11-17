'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const nav = [
  { label: 'Jornadas', href: '/canal' },
  { label: 'Acompanhamento', href: '/canal/acompanhamento' },
  { label: 'Contratos', href: '/canal/contratos' },
]

export default function CanalLayout({ children }: { children: React.ReactNode }) {
  const { user, persona, ready, logout, sessionEmail } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const isLogin = pathname === '/canal/login'
  const allowed = !!user && persona === 'vendedor'

  useEffect(() => {
    if (ready && !isLogin && !allowed) router.replace('/canal/login')
  }, [ready, isLogin, allowed, router])

  if (isLogin) return <>{children}</>
  if (!ready || !allowed) return null

  const vendedor = (sessionEmail || 'vendedor').split('@')[0].replace(/[._-]+/g, ' ')

  return (
    <div className="min-h-screen bg-[#f6f5f1] text-gray-900">
      <header className="bg-fontara-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center gap-8">
          <a href="/" className="shrink-0 flex items-center gap-3">
            <Image src="/logo.png" alt="Fontara Seguros" width={120} height={40} className="object-contain brightness-0 invert" priority />
            <span className="hidden sm:inline text-[11px] text-white/50 border-l border-white/20 pl-3">Canal</span>
          </a>
          <nav className="flex items-center gap-1 overflow-x-auto h-full" aria-label="Navegação do canal">
            {nav.map((n) => {
              const active = n.href === '/canal' ? pathname === '/canal' || pathname.startsWith('/canal/nova-jornada') : pathname.startsWith(n.href)
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`h-full flex items-center px-3 text-sm whitespace-nowrap border-b-2 transition ${
                    active ? 'border-fontara-amber text-white' : 'border-transparent text-white/55 hover:text-white'
                  }`}
                >
                  {n.label}
                </Link>
              )
            })}
          </nav>
          <div className="ml-auto flex items-center gap-5 shrink-0">
            <div className="hidden md:block text-right leading-tight">
              <p className="text-sm text-white capitalize">{vendedor}</p>
              <p className="text-[11px] text-white/45 tabular-nums">Agência 0412 · Canal banco</p>
            </div>
            <button
              onClick={() => {
                logout()
                router.push('/canal/login')
              }}
              className="text-sm text-white/60 hover:text-white transition"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10">{children}</main>
    </div>
  )
}
