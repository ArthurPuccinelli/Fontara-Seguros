import { Star, Quote } from 'lucide-react'

const depoimentos = [
  {
    nome: 'Ana Carolina Silva',
    cargo: 'Empresária',
    texto:
      'Contratar o seguro empresarial pela Fontara foi incrível. Tudo online, a proposta chegou rapidinho e assinei pelo celular mesmo. Super recomendo!',
    avatar: 'AC',
    rating: 5,
    seguro: 'Seguro Empresarial',
  },
  {
    nome: 'Roberto Mendes',
    cargo: 'Engenheiro Civil',
    texto:
      'Tive um sinistro no meu carro e a Fontara resolveu tudo em menos de 48h. Atendimento humanizado de verdade. Nunca mais vou contratar seguro de outra forma.',
    avatar: 'RM',
    rating: 5,
    seguro: 'Seguro Auto',
  },
  {
    nome: 'Juliana Ferreira',
    cargo: 'Médica',
    texto:
      'Finalmente encontrei uma corretora que explica tudo de forma clara. A cotação foi rápida e o preço do seguro de vida ficou bem abaixo do que eu esperava.',
    avatar: 'JF',
    rating: 5,
    seguro: 'Seguro de Vida',
  },
  {
    nome: 'Marcos Oliveira',
    cargo: 'Diretor de TI',
    texto:
      'A assinatura digital via DocuSign foi um diferencial enorme. Zero papelada, zero burocracia. Em 10 minutos já estava tudo resolvido.',
    avatar: 'MO',
    rating: 5,
    seguro: 'Seguro Residencial',
  },
  {
    nome: 'Camila Santos',
    cargo: 'Designer',
    texto:
      'Viajei para a Europa com total tranquilidade. O seguro viagem da Fontara me amparou quando precisei de assistência médica lá fora. Valeu muito!',
    avatar: 'CS',
    rating: 5,
    seguro: 'Seguro Viagem',
  },
  {
    nome: 'Paulo Henrique Lima',
    cargo: 'Contador',
    texto:
      'Já indiquei a Fontara para toda a minha família. O atendimento é excelente e os preços são justos. Empresa séria e comprometida.',
    avatar: 'PH',
    rating: 5,
    seguro: 'Seguro Saúde',
  },
]

export default function Depoimentos() {
  return (
    <section id="depoimentos" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-fontara-accent font-semibold text-sm uppercase tracking-widest mb-3">
            Depoimentos
          </span>
          <h2 className="section-heading mb-4">
            O que nossos clientes{' '}
            <span className="text-fontara-accent">dizem</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Mais de 50 mil clientes satisfeitos. Veja por que eles escolheram a Fontara Seguros.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {depoimentos.map((dep) => (
            <div key={dep.nome} className="card p-6 flex flex-col">
              {/* Quote icon */}
              <Quote className="text-fontara-light mb-4" size={32} />

              {/* Stars */}
              <div className="flex gap-1 mb-3">
                {Array.from({ length: dep.rating }).map((_, i) => (
                  <Star key={i} size={16} className="text-fontara-amber fill-fontara-amber" />
                ))}
              </div>

              <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-6">
                "{dep.texto}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fontara-blue to-fontara-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {dep.avatar}
                </div>
                <div>
                  <p className="font-semibold text-fontara-navy text-sm">{dep.nome}</p>
                  <p className="text-gray-400 text-xs">{dep.cargo} · {dep.seguro}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
