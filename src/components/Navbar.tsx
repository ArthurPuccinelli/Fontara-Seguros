'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Menu, X, Phone, LogIn } from 'lucide-react'

// Mesmo padrão visual dos cabeçalhos da Área do Cliente e do Portal do Canal:
// barra navy fixa com logo em branco, ações à direita e abas de navegação logo abaixo.
const navLinks = [
  { label: 'Seguros', href: '#seguros' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Diferenciais', href: '#diferenciais' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Cotação', href: '#cotacao' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-fontara-navy shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <a href="#" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Fontara Seguros" width={130} height={44} className="object-contain brightness-0 invert" priority />
        </a>

        <div className="hidden md:flex items-center gap-5">
          <a href="tel:+551130000000" className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition">
            <Phone size={15} />
            (11) 3000-0000
          </a>
          <a href="/canal/login" className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition">
            Portal do Canal
          </a>
          <a
            href="/area-cliente/login"
            className="flex items-center gap-2 text-sm font-semibold text-fontara-navy bg-fontara-amber hover:bg-fontara-gold px-4 py-2 rounded-lg transition"
          >
            <LogIn size={15} />
            Área do Cliente
          </a>
        </div>

        <button className="md:hidden text-white p-2" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <nav className="hidden md:flex max-w-6xl mx-auto px-4 sm:px-6 gap-1 overflow-x-auto" aria-label="Navegação do site">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="px-4 py-2.5 text-sm whitespace-nowrap border-b-2 border-transparent text-white/60 hover:text-white hover:border-fontara-amber transition"
          >
            {link.label}
          </a>
        ))}
      </nav>

      {open && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-white/80 hover:text-white py-2 text-sm">
              {link.label}
            </a>
          ))}
          <a href="/canal/login" onClick={() => setOpen(false)} className="text-white/80 hover:text-white py-2 text-sm">
            Portal do Canal
          </a>
          <a
            href="/area-cliente/login"
            onClick={() => setOpen(false)}
            className="mt-2 text-center text-sm font-semibold text-fontara-navy bg-fontara-amber px-4 py-2.5 rounded-lg"
          >
            Área do Cliente
          </a>
        </div>
      )}
    </header>
  )
}
