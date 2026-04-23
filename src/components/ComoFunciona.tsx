import { ClipboardList, Search, FileSignature, ShieldCheck } from 'lucide-react'

const steps = [
  {
    icon: ClipboardList,
    step: '01',
    title: 'Preencha o formulário',
    description:
      'Informe seus dados básicos e o tipo de seguro que você precisa. Leva menos de 2 minutos.',
  },
  {
    icon: Search,
    step: '02',
    title: 'Análise personalizada',
    description:
      'Nossa equipe analisa seu perfil e busca as melhores opções de cobertura nas principais seguradoras.',
  },
  {
    icon: FileSignature,
    step: '03',
    title: 'Assine digitalmente',
    description:
      'Receba sua proposta e assine eletronicamente com segurança via DocuSign, sem precisar sair de casa.',
  },
  {
    icon: ShieldCheck,
    step: '04',
    title: 'Proteção ativada',
    description:
      'Pronto! Sua apólice é emitida imediatamente e você já está protegido. Simples assim.',
  },
]

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="py-24 bg-fontara-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-fontara-accent font-semibold text-sm uppercase tracking-widest mb-3">
            Processo
          </span>
          <h2 className="section-heading mb-4">
            Como funciona em{' '}
            <span className="text-fontara-accent">4 passos</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Contratar um seguro nunca foi tão simples. Do formulário à apólice, tudo 100% digital.
          </p>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-fontara-blue via-fontara-accent to-fontara-gold" />

          {steps.map((step, i) => (
            <div key={step.step} className="relative flex flex-col items-center text-center">
              {/* Step number */}
              <div className="relative z-10 mb-6">
                <div className="w-24 h-24 rounded-full bg-white shadow-blue flex flex-col items-center justify-center">
                  <step.icon className="text-fontara-accent mb-1" size={28} />
                  <span className="text-xs font-bold text-fontara-gold">{step.step}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-fontara-navy mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a href="#cotacao" className="btn-primary inline-flex items-center gap-2">
            Começar agora — é grátis
          </a>
        </div>
      </div>
    </section>
  )
}
