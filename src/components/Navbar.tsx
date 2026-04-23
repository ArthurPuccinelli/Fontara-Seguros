'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Phone, ChevronDown } from 'lucide-react';

const navLinks = [
  {
    label: 'Seguros',
    href: '#seguros',
    children: [
      { label: 'Seguro Auto', href: '#auto', icon: '🚗' },
      { label: 'Seguro de Vida', href: '#vida', icon: '❤️' },
      { label: 'Seguro Empresarial', href: '#empresarial', icon: '🏢' },
    ],
  },
  { label: 'Como Funciona', href: '#como-funciona' },
  { label: 'Por que Fontara', href: '#diferenciais' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Contato', href: '#contato' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#D4EDE6]'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Fontara Seguradora"
              width={140}
              height={44}
              className="h-10 w-auto object-contain"
              style={{ filter: isScrolled ? 'none' : 'brightness(0) invert(1)' }}
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className="relative">
                  <button
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      isScrolled
                        ? 'text-[#1C3A32] hover:bg-[#F0FAF7]'
                        : 'text-white/90 hover:bg-white/10'
                    }`}
                  >
                    {link.label}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {dropdownOpen && (
                    <div
                      onMouseEnter={() => setDropdownOpen(true)}
                      onMouseLeave={() => setDropdownOpen(false)}
                      className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-[#D4EDE6] py-2 z-50"
                    >
                      {link.children.map((child) => (
                        <a
                          key={child.label}
                          href={child.href}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-[#1C3A32] hover:bg-[#F7FDFB] transition-colors"
                        >
                          <span className="text-lg">{child.icon}</span>
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    isScrolled
                      ? 'text-[#1C3A32] hover:bg-[#F0FAF7]'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </a>
              )
            )}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:08007070700"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isScrolled ? 'text-[#1C3A32]' : 'text-white/90'
              }`}
            >
              <Phone className="w-4 h-4" />
              0800 707 0700
            </a>
            <a
              href="#cotacao"
              className="inline-flex items-center gap-2 bg-[#3DFFC0] hover:bg-[#00D4A8] text-[#1C3A32] font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md text-sm"
            >
              Cotação Grátis
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              isScrolled ? 'text-[#1C3A32]' : 'text-white'
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-[#D4EDE6] shadow-xl">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <div key={link.label}>
                {link.children ? (
                  <>
                    <p className="px-3 py-2 text-xs font-semibold text-[#5A7A70] uppercase tracking-wider mt-2">
                      {link.label}
                    </p>
                    {link.children.map((child) => (
                      <a
                        key={child.label}
                        href={child.href}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[#1C3A32] hover:bg-[#F7FDFB] rounded-lg"
                        onClick={() => setMobileOpen(false)}
                      >
                        <span>{child.icon}</span>
                        {child.label}
                      </a>
                    ))}
                  </>
                ) : (
                  <a
                    href={link.href}
                    className="block px-3 py-3 text-sm font-medium text-[#1C3A32] hover:bg-[#F7FDFB] rounded-lg"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                )}
              </div>
            ))}
            <div className="pt-3 border-t border-[#D4EDE6] mt-3 space-y-2">
              <a
                href="tel:08007070700"
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#1C3A32] font-medium"
              >
                <Phone className="w-4 h-4" />
                0800 707 0700 (Gratuito)
              </a>
              <a
                href="#cotacao"
                className="inline-flex items-center justify-center gap-2 w-full bg-[#3DFFC0] hover:bg-[#00D4A8] text-[#1C3A32] font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-md text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Cotação Grátis
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
