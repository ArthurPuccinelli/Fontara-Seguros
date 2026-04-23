import { Award, Clock, HeadphonesIcon, Lock, TrendingDown, Users } from 'lucide-react'

const diferenciais = [
  {
    icon: Award,
    title: 'Melhores seguradoras',
    description: 'Parceria com as top 10 seguradoras do Brasil, garantindo solidez e credibilidade.',
  },
  {
    icon: TrendingDown,
    title: 'Preços competitivos',
    description: 'Comparamos automaticamente as melhores opções para você pagar menos pelo mesmo.',
  },
  {
    icon: Clock,
    title: 'Cotação em minutos',
    description: 'Processo 100% digital: da cotação à emissão da apólice em tempo recorde.',
  },
  {
    icon: Lock,
    title: 'Assinatura digital segura',
    description: 'Integração com DocuSign para contratos com validade jurídica e total segurança.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Suporte humanizado',
    description: 'Equipe de especialistas disponível 24h por dia, 7 dias por semana.',
  },
  {
    icon: Users,
    title: '+50 mil clientes',
    description: 'Uma comunidade de clientes satisfeitos que confiam na Fontara Seguros.',
  },
]

export default function Diferenciais() {
  return (
    <section id="diferenciais" className="py-24 bg-fontara-navy relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-fontara-accent/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-fontara-gold/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-fontara-amber font-semibold text-sm uppercase tracking-widest mb-3">
            Por que a Fontara?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Diferenciais que fazem{' '}
            <span className="gradient-text">a diferença</span>
          </h2>
          <p className="text-white/60 max-w-xl mx-auto text-lg">
            Não somos apenas uma corretora. Somos seu parceiro na proteção do que importa.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {diferenciais.map((item) => (
            <div
              key={item.title}
              className="glass rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-fontara-gold/10 flex items-center justify-center mb-4 group-hover:bg-fontara-gold/20 transition-colors">
                <item.icon className="text-fontara-amber" size={24} />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '15+', label: 'Anos de mercado' },
            { value: '50k+', label: 'Clientes ativos' },
            { value: 'R$ 2B+', label: 'Em sinistros pagos' },
            { value: '4.9★', label: 'Avaliação média' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-bold gradient-text mb-1">{stat.value}</p>
              <p className="text-white/50 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
