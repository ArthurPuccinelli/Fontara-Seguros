import {
  Shield,
  Clock,
  Smartphone,
  PhoneCall,
  BadgeCheck,
  TrendingUp,
} from 'lucide-react';

const diferenciais = [
  {
    icon: BadgeCheck,
    title: 'Regulada pela SUSEP',
    description:
      'Operamos com total conformidade regulatória, garantindo segurança jurídica para todos os seus contratos.',
  },
  {
    icon: Clock,
    title: 'Aprovação em Minutos',
    description:
      'Nossa tecnologia de análise automatizada aprova sua proposta na hora, sem espera e sem burocracia.',
  },
  {
    icon: PhoneCall,
    title: 'Atendimento 24/7',
    description:
      'Time especializado disponível a qualquer hora do dia ou da noite, por WhatsApp, chat ou telefone.',
  },
  {
    icon: Smartphone,
    title: '100% Digital',
    description:
      'Da cotação ao sinistro, tudo pelo app ou portal web. Sem papelada, sem agência, sem filas.',
  },
  {
    icon: TrendingUp,
    title: 'Melhor Custo-Benefício',
    description:
      'Comparamos as melhores coberturas do mercado e oferecemos a opção mais vantajosa para o seu perfil.',
  },
  {
    icon: Shield,
    title: '99.2% de Pagamentos',
    description:
      'Índice de aprovação de sinistros acima da média do mercado. Quando você precisa, a Fontara está lá.',
  },
];

export default function Diferenciais() {
  return (
    <section id="diferenciais" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 bg-[#C8FFF0] text-[#1C3A32] text-xs font-semibold px-3 py-1.5 rounded-full">
            Por que Fontara
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1C3A32] leading-tight mt-4">
            O seguro que protege e
            <span className="text-[#1C3A32]"> que simplifica</span>
          </h2>
          <p className="text-lg text-[#5A7A70] mt-4 mx-auto max-w-xl">
            Combinamos tecnologia, transparência e atendimento humanizado para
            entregar a melhor experiência em seguros do Brasil.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {diferenciais.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.title}
                className="bg-white rounded-2xl p-6 border border-[#D4EDE6] transition-all duration-300 hover:border-[#3DFFC0] hover:shadow-lg group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#F0FAF7] group-hover:bg-[#3DFFC0]/25 flex items-center justify-center mb-4 transition-colors">
                  <Icon className="w-6 h-6 text-[#1C3A32]" />
                </div>
                <h3 className="font-bold text-[#1C3A32] mb-2">{d.title}</h3>
                <p className="text-sm text-[#5A7A70] leading-relaxed">{d.description}</p>
              </div>
            );
          })}
        </div>

        {/* Trust bar */}
        <div className="mt-16 rounded-2xl bg-[#1C3A32] p-8">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {[
              { value: '500K+', label: 'Clientes Ativos' },
              { value: 'R$ 2B+', label: 'em Coberturas' },
              { value: '15 anos', label: 'de Experiência' },
              { value: '#1', label: 'Satisfação ANPD' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-[#3DFFC0]">{stat.value}</p>
                <p className="text-white/70 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
