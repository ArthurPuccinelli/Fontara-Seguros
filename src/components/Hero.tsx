'use client';

import { ArrowRight, Shield, Star, Users, Award } from 'lucide-react';

const stats = [
  { icon: Users, value: '500K+', label: 'Clientes Protegidos' },
  { icon: Shield, value: '99.2%', label: 'Sinistros Pagos' },
  { icon: Star, value: '4.9/5', label: 'Avaliação Média' },
  { icon: Award, value: '15 anos', label: 'No Mercado' },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F211B] via-[#1C3A32] to-[#2A5445]" />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.06]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-20 right-[-5%] w-[500px] h-[500px] rounded-full bg-[#3DFFC0]/15 blur-3xl" />
      <div className="absolute bottom-10 left-[10%] w-72 h-72 rounded-full bg-[#3DFFC0]/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="text-white">
            <div className="badge mb-6 bg-[#3DFFC0]/20 text-[#3DFFC0] border border-[#3DFFC0]/30">
              <Shield className="w-3.5 h-3.5" />
              Aprovado pela SUSEP · Desde 2010
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.15] mb-6 tracking-tight">
              Proteção de verdade
              <span className="block" style={{ color: '#3DFFC0' }}>
                para o que é seu
              </span>
            </h1>

            <p className="text-lg text-white/75 mb-8 max-w-lg leading-relaxed">
              Seguros para auto, vida e empresas com aprovação imediata. Atendimento
              humanizado 24h e o melhor custo-benefício do mercado.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <a href="#cotacao" className="btn-primary text-base px-8 py-4 text-[#1C3A32]">
                Fazer Cotação Grátis
                <ArrowRight className="w-5 h-5" />
              </a>
              <a href="#seguros" className="btn-outline text-base px-8 py-4">
                Nossos Seguros
              </a>
            </div>

            <div className="flex flex-wrap gap-5 text-sm text-white/65">
              {['Sem taxa de adesão', 'Cancelamento gratuito', 'Parcela no cartão'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#3DFFC0] flex items-center justify-center text-[#1C3A32] font-bold text-[10px]">
                    ✓
                  </span>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Quick quote */}
          <div>
            <div
              className="rounded-2xl p-8"
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(61,255,192,0.20)',
              }}
            >
              <h2 className="text-white font-bold text-xl mb-1">Cotação em 2 minutos</h2>
              <p className="text-white/60 text-sm mb-6">
                Preencha os dados e receba a melhor proposta
              </p>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-1.5">
                    Tipo de seguro
                  </label>
                  <select className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3DFFC0]/40 focus:border-[#3DFFC0]">
                    <option value="" className="text-gray-900">Selecione o seguro</option>
                    <option value="auto" className="text-gray-900">Seguro Auto</option>
                    <option value="vida" className="text-gray-900">Seguro de Vida</option>
                    <option value="empresarial" className="text-gray-900">Seguro Empresarial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-1.5">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    placeholder="João Silva"
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/35 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3DFFC0]/40 focus:border-[#3DFFC0]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1.5">
                      CPF / CNPJ
                    </label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/35 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3DFFC0]/40 focus:border-[#3DFFC0]"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1.5">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/35 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3DFFC0]/40 focus:border-[#3DFFC0]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#3DFFC0] hover:bg-[#00D4A8] text-[#1C3A32] font-bold py-4 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-lg"
                >
                  Ver Minha Cotação
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <p className="text-center text-white/45 text-xs mt-4">
                🔒 Dados protegidos · LGPD
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="text-center py-5 px-4 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(61,255,192,0.12)',
              }}
            >
              <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: '#3DFFC0' }} />
              <p className="text-white font-bold text-2xl">{value}</p>
              <p className="text-white/55 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 80L60 72C120 64 240 48 360 44C480 40 600 48 720 52C840 56 960 56 1080 52C1200 48 1320 40 1380 36L1440 32V80H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
