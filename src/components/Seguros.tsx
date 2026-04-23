import { Car, Heart, Home, Building2, Briefcase, Plane, ArrowRight } from 'lucide-react'

const seguros = [
  {
    icon: Heart,
    title: 'Seguro de Vida',
    description:
      'Proteção financeira para sua família em momentos difíceis. Coberturas por morte, invalidez e doenças graves.',
    features: ['Morte natural e acidental', 'Invalidez permanente', 'Doenças graves'],
    color: 'from-red-500/10 to-red-600/5',
    iconColor: 'text-red-500',
    iconBg: 'bg-red-500/10',
    href: '#cotacao',
  },
  {
    icon: Car,
    title: 'Seguro Auto',
    description:
      'Proteção completa para seu veículo contra roubo, colisão e danos a terceiros. Com assistência 24h.',
    features: ['Cobertura total (colisão, roubo)', 'Carro reserva', 'Assistência 24h'],
    color: 'from-blue-500/10 to-blue-600/5',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
    href: '#cotacao',
  },
  {
    icon: Home,
    title: 'Seguro Residencial',
    description:
      'Seu lar protegido contra incêndio, roubo, danos elétricos e muito mais. Tranquilidade para você e sua família.',
    features: ['Incêndio e explosão', 'Roubo e furto qualificado', 'Danos elétricos'],
    color: 'from-green-500/10 to-green-600/5',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-500/10',
    href: '#cotacao',
  },
  {
    icon: Building2,
    title: 'Seguro Empresarial',
    description:
      'Proteja seu negócio com cobertura abrangente para patrimônio, responsabilidade civil e interrupção de atividades.',
    features: ['Patrimônio e equipamentos', 'Responsabilidade civil', 'Lucros cessantes'],
    color: 'from-purple-500/10 to-purple-600/5',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-500/10',
    href: '#cotacao',
  },
  {
    icon: Briefcase,
    title: 'Seguro Saúde',
    description:
      'Planos de saúde individuais, familiares e empresariais com ampla rede credenciada em todo o Brasil.',
    features: ['Rede credenciada nacional', 'Cobertura ambulatorial e hospitalar', 'Telemedicina inclusa'],
    color: 'from-teal-500/10 to-teal-600/5',
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-500/10',
    href: '#cotacao',
  },
  {
    icon: Plane,
    title: 'Seguro Viagem',
    description:
      'Viaje com tranquilidade. Cobertura médica internacional, cancelamento de voo e extravio de bagagem.',
    features: ['Assistência médica internacional', 'Cancelamento de voo', 'Extravio de bagagem'],
    color: 'from-amber-500/10 to-amber-600/5',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-500/10',
    href: '#cotacao',
  },
]

export default function Seguros() {
  return (
    <section id="seguros" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-fontara-accent font-semibold text-sm uppercase tracking-widest mb-3">
            Nossos Produtos
          </span>
          <h2 className="section-heading mb-4">
            Seguros para cada{' '}
            <span className="text-fontara-accent">necessidade</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Soluções personalizadas para proteger você, sua família e seus bens com a cobertura certa.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {seguros.map((seg) => (
            <div key={seg.title} className={`card p-6 bg-gradient-to-br ${seg.color}`}>
              <div className={`w-12 h-12 rounded-2xl ${seg.iconBg} flex items-center justify-center mb-5`}>
                <seg.icon className={`${seg.iconColor}`} size={24} />
              </div>

              <h3 className="text-xl font-bold text-fontara-navy mb-2">{seg.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{seg.description}</p>

              <ul className="space-y-2 mb-6">
                {seg.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-gray-600 text-sm">
                    <span className={`w-1.5 h-1.5 rounded-full ${seg.iconBg} ${seg.iconColor} bg-current`} />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={seg.href}
                className={`flex items-center gap-2 text-sm font-semibold ${seg.iconColor} hover:gap-3 transition-all duration-200`}
              >
                Solicitar Cotação <ArrowRight size={16} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
