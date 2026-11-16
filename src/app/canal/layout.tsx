'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const nav = [
  { label: 'Catálogo de jornadas', href: '/canal' },
  { label: 'Acompanhamento', href: '/canal/acompanhamento' },
  { label: 'Contratos', href: '/canal/contratos' },
]

export default function CanalLayout({ children }: { children: React.ReactNode }) {
  const { user, persona, ready, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const isLogin = pathname === '/canal/login'
  const allowed = !!user && persona === 'vendedor'

  useEffect(() => {
    if (ready && !isLogin && !allowed) router.replace('/canal/login')
  }, [ready, isLogin, allowed, router])

  if (isLogin) return <>{children}</>
  if (!ready || !allowed) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-fontara-navy shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/">
              <Image src="/logo.png" alt="Fontara Seguros" width={130} height={44} className="object-contain brightness-0 invert" priority />
            </a>
            <span className="hidden sm:inline text-[11px] uppercase tracking-widest text-fontara-amber font-semibold border-l border-white/20 pl-3">
              Portal do Canal
            </span>
          </div>
          <button
            onClick={() => {
              logout()
              router.push('/canal/login')
            }}
            className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto" aria-label="Navegação do canal">
          {nav.map((n) => {
            const active = n.href === '/canal' ? pathname === '/canal' || pathname.startsWith('/canal/nova-jornada') : pathname.startsWith(n.href)
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition ${
                  active ? 'border-fontara-amber text-white font-semibold' : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                {n.label}
              </Link>
            )
          })}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  )
}
