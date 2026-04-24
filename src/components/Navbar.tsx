'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Menu, X, Phone } from 'lucide-react'

const navLinks = [
  { label: 'Seguros', href: '#seguros' },
  { label: 'Como Funciona', href: '#como-funciona' },
  { label: 'Diferenciais', href: '#diferenciais' },
  { label: 'Depoimentos', href: '#depoimentos' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-fontara-navy/95 backdrop-blur-md shadow-lg py-3' : 'bg-white/15 backdrop-blur-md py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Fontara Seguros"
            width={180}
            height={60}
            className="object-contain"
            priority
          />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-white/80 hover:text-fontara-amber font-medium text-sm transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="tel:+551130000000"
            className="flex items-center gap-2 text-white/70 hover:text-fontara-amber text-sm transition-colors"
          >
            <Phone size={16} />
            (11) 3000-0000
          </a>
          <a href="/area-cliente/login" className="btn-primary text-sm">
            Área do Cliente
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-fontara-navy/98 backdrop-blur-lg border-t border-white/10 px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block text-white/80 hover:text-fontara-amber font-medium py-2 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#cotacao"
            onClick={() => setOpen(false)}
            className="block btn-primary text-center text-sm mt-4"
          >
            Solicitar Cotação
          </a>
        </div>
      )}
    </header>
  )
}
