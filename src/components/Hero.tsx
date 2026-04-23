'use client'

import { Shield, ArrowRight, CheckCircle } from 'lucide-react'

const highlights = [
  'Mais de 15 anos de experiência',
  'Atendimento 24h / 7 dias',
  'Coberturas personalizadas',
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-hero-pattern">
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-fontara-accent/10 blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] rounded-full bg-fontara-gold/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 grid md:grid-cols-2 gap-12 items-center">
        {/* Left content */}
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-fontara-gold/20 border border-fontara-gold/30 rounded-full px-4 py-2 text-fontara-amber text-sm font-medium mb-6">
            <Shield size={16} />
            Proteção que você pode confiar
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Segurança para{' '}
            <span className="gradient-text">cada momento</span>{' '}
            da sua vida
          </h1>

          <p className="text-lg text-white/70 mb-8 max-w-lg leading-relaxed">
            Oferecemos soluções completas em seguros para pessoas e empresas.
            Proteja o que é mais importante para você com cobertura de qualidade
            e atendimento humanizado.
          </p>

          <ul className="space-y-3 mb-10">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-white/80">
                <CheckCircle size={18} className="text-fontara-amber shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-4">
            <a href="#cotacao" className="btn-primary flex items-center gap-2">
              Cotação Gratuita
              <ArrowRight size={18} />
            </a>
            <a href="#seguros" className="btn-outline">
              Nossos Seguros
            </a>
          </div>
        </div>

        {/* Right — stats card */}
        <div className="hidden md:flex justify-center items-center">
          <div className="relative animate-float">
            {/* Main card */}
            <div className="glass rounded-3xl p-8 w-80">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-white/60 text-sm">Clientes protegidos</p>
                  <p className="text-4xl font-bold text-white mt-1">50k+</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-fontara-gold/20 flex items-center justify-center">
                  <Shield className="text-fontara-amber" size={24} />
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Seguro de Vida', value: '98%', color: 'bg-green-400' },
                  { label: 'Satisfação', value: '4.9★', color: 'bg-fontara-amber' },
                  { label: 'Sinistros pagos', value: 'R$ 2B+', color: 'bg-blue-400' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                      <span className="text-white/70 text-sm">{stat.label}</span>
                    </div>
                    <span className="text-white font-semibold text-sm">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 glass rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-400/20 flex items-center justify-center">
                <CheckCircle className="text-green-400" size={20} />
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Aprovado!</p>
                <p className="text-white/60 text-xs">Cotação em 2 min</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 80L60 69.3C120 58.7 240 37.3 360 32C480 26.7 600 37.3 720 42.7C840 48 960 48 1080 42.7C1200 37.3 1320 26.7 1380 21.3L1440 16V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}
