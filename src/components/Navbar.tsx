'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Menu, X, LogIn } from 'lucide-react'

// Mesmo visual dos cabeçalhos da Área do Cliente e do Portal do Canal (barra navy, logo em branco),
// em uma única linha: logo, links das seções e ações.
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        <a href="#" className="flex items-center shrink-0">
          <Image src="/logo.png" alt="Fontara Seguros" width={130} height={44} className="object-contain brightness-0 invert" priority />
        </a>

        <nav className="hidden lg:flex items-center gap-6" aria-label="Navegação do site">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-white/70 hover:text-white transition">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-5 shrink-0">
          <a href="/canal/login" className="text-sm text-white/70 hover:text-white transition">
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

        <button className="lg:hidden text-white p-2" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-white/80 hover:text-white py-2 text-sm">
              {link.label}
            </a>
          ))}
          <a href="/canal/login" onClick={() => setOpen(false)} className="md:hidden text-white/80 hover:text-white py-2 text-sm">
            Portal do Canal
          </a>
          <a
            href="/area-cliente/login"
            onClick={() => setOpen(false)}
            className="md:hidden mt-2 text-center text-sm font-semibold text-fontara-navy bg-fontara-amber px-4 py-2.5 rounded-lg"
          >
            Área do Cliente
          </a>
        </div>
      )}
    </header>
  )
}
