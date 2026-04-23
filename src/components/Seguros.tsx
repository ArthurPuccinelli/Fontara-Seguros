'use client';

import { ArrowRight, Car, Heart, Building2, CheckCircle2 } from 'lucide-react';

const seguros = [
  {
    id: 'auto',
    icon: Car,
    title: 'Seguro Auto',
    subtitle: 'Proteção completa para seu veículo',
    description:
      'Cobertura contra colisão, roubo, furto, incêndio e danos naturais. Assistência 24h em todo o Brasil com guincho, chaveiro e carro reserva.',
    color: '#3DFFC0',
    features: [
      'Cobertura contra roubo e furto',
      'Danos a terceiros',
      'Assistência 24h / guincho',
      'Carro reserva incluso',
      'Vidros e faróis',
      'Proteção de equipamentos',
    ],
    cta: 'Cotar Seguro Auto',
    badge: 'Mais Popular',
  },
  {
    id: 'vida',
    icon: Heart,
    title: 'Seguro de Vida',
    subtitle: 'Cuide de quem você ama',
    description:
      'Garantia financeira para sua família em qualquer eventualidade. Cobertura por morte, invalidez, doenças graves e assistências complementares.',
    color: '#3DFFC0',
    features: [
      'Indenização por morte',
      'Invalidez permanente',
      'Doenças graves',
      'Diária por internação',
      'Funeral assistido',
      'Assistência psicológica',
    ],
    cta: 'Cotar Seguro de Vida',
    badge: null,
  },
  {
    id: 'empresarial',
    icon: Building2,
    title: 'Seguro Empresarial',
    subtitle: 'Blindagem total para o seu negócio',
    description:
      'Proteção abrangente para empresas de todos os portes. Cobertura de incêndio, responsabilidade civil, lucros cessantes e muito mais.',
    color: '#3DFFC0',
    features: [
      'Incêndio e explosão',
      'Responsabilidade civil',
      'Lucros cessantes',
      'Equipamentos eletrônicos',
      'Roubo de mercadorias',
      'Acidentes de trabalho',
    ],
    cta: 'Cotar Seguro Empresarial',
    badge: null,
  },
];

export default function Seguros() {
  return (
    <section id="seguros" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="badge">Nossos Produtos</span>
          <h2 className="section-title mt-4">
            Seguros feitos para
            <span className="text-[#3DFFC0] block" style={{ WebkitTextStroke: '1px #00D4A8', color: 'transparent', WebkitTextFillColor: 'transparent' }}>
              &nbsp;
            </span>
            <span>proteger o que importa</span>
          </h2>
          <p className="section-subtitle mx-auto max-w-xl">
            Produtos desenhados para cada fase da sua vida e do seu negócio,
            com cobertura completa e aprovação em minutos.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {seguros.map((seguro, idx) => {
            const Icon = seguro.icon;
            return (
              <div
                key={seguro.id}
                id={seguro.id}
                className="relative rounded-2xl border border-[#D4EDE6] p-8 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group bg-white"
              >
                {seguro.badge && (
                  <div className="absolute -top-3 left-6">
                    <span className="bg-[#3DFFC0] text-[#1C3A32] text-xs font-bold px-3 py-1 rounded-full">
                      {seguro.badge}
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-[#F0FAF7] flex items-center justify-center mb-6 group-hover:bg-[#3DFFC0]/20 transition-colors">
                  <Icon className="w-7 h-7 text-[#1C3A32]" />
                </div>

                <div className="mb-1">
                  <span className="text-xs font-semibold text-[#5A7A70] uppercase tracking-wider">
                    {seguro.subtitle}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#1C3A32] mb-3">{seguro.title}</h3>
                <p className="text-[#5A7A70] text-sm leading-relaxed mb-6">
                  {seguro.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-8 flex-1">
                  {seguro.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#1C3A32]">
                      <CheckCircle2 className="w-4 h-4 text-[#3DFFC0] flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="#cotacao"
                  className="btn-dark w-full justify-center text-sm group-hover:bg-[#3DFFC0] group-hover:text-[#1C3A32] transition-all"
                >
                  {seguro.cta}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-[#5A7A70] text-sm">
            Não encontrou o que procura?{' '}
            <a href="#contato" className="text-[#1C3A32] font-semibold hover:underline">
              Fale com um especialista
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
