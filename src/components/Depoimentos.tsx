import { Star, Quote } from 'lucide-react';

const depoimentos = [
  {
    name: 'Mariana Costa',
    role: 'Empresária · São Paulo, SP',
    avatar: 'MC',
    rating: 5,
    text: 'Contratei o seguro empresarial da Fontara e quando tive um incêndio no depósito, fui atendida em menos de 2 horas. O processo de indenização foi rápido e transparente. Recomendo muito!',
    seguro: 'Seguro Empresarial',
  },
  {
    name: 'Ricardo Almeida',
    role: 'Médico · Belo Horizonte, MG',
    avatar: 'RA',
    rating: 5,
    text: 'Excelente custo-benefício no seguro de vida. A cotação foi feita em menos de 3 minutos pelo app e a apólice chegou no email logo em seguida. Processo incrivelmente simples.',
    seguro: 'Seguro de Vida',
  },
  {
    name: 'Felipe Torres',
    role: 'Engenheiro · Curitiba, PR',
    avatar: 'FT',
    rating: 5,
    text: 'Tive meu carro roubado e a Fontara me pagou dentro do prazo prometido. O atendimento 24h funcionou perfeitamente. Nunca mais vou mudar de seguradora.',
    seguro: 'Seguro Auto',
  },
  {
    name: 'Ana Beatriz Souza',
    role: 'Advogada · Rio de Janeiro, RJ',
    avatar: 'AB',
    rating: 5,
    text: 'Já contratei seguro em várias seguradoras e a Fontara é, de longe, a mais transparente. Sem letrinhas miúdas, sem surpresas na hora do sinistro. Atendimento nota 10.',
    seguro: 'Seguro Auto',
  },
  {
    name: 'Carlos Mendonça',
    role: 'Varejista · Fortaleza, CE',
    avatar: 'CM',
    rating: 5,
    text: 'Protegi minha loja com o seguro empresarial. O preço foi bem melhor do que eu esperava e a cobertura é completa. O consultor me ajudou a escolher o plano ideal para meu negócio.',
    seguro: 'Seguro Empresarial',
  },
  {
    name: 'Juliana Lima',
    role: 'Professora · Porto Alegre, RS',
    avatar: 'JL',
    rating: 5,
    text: 'O seguro de vida da Fontara me deu tranquilidade. Processo 100% digital, sem precisar ir a lugar nenhum. Recomendo para todas as famílias.',
    seguro: 'Seguro de Vida',
  },
];

export default function Depoimentos() {
  return (
    <section id="depoimentos" className="py-24 bg-[#F7FDFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 bg-[#C8FFF0] text-[#1C3A32] text-xs font-semibold px-3 py-1.5 rounded-full">
            Depoimentos
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1C3A32] leading-tight mt-4">
            Quem protegemos,
            <span className="text-[#1C3A32]"> aprova</span>
          </h2>
          <p className="text-lg text-[#5A7A70] mt-4 mx-auto max-w-lg">
            Mais de 500 mil clientes confiam na Fontara. Veja o que eles dizem.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {depoimentos.map((dep) => (
            <div
              key={dep.name}
              className="bg-white rounded-2xl p-6 border border-[#D4EDE6] flex flex-col hover:border-[#3DFFC0] hover:shadow-lg transition-all duration-300"
            >
              <Quote className="w-7 h-7 text-[#3DFFC0] mb-4 opacity-70" />

              <p className="text-sm text-[#1C3A32] leading-relaxed flex-1 mb-6">
                &ldquo;{dep.text}&rdquo;
              </p>

              <div>
                <div className="flex mb-3">
                  {Array.from({ length: dep.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#3DFFC0] text-[#3DFFC0]" />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1C3A32] flex items-center justify-center text-[#3DFFC0] font-bold text-xs flex-shrink-0">
                    {dep.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1C3A32] text-sm">{dep.name}</p>
                    <p className="text-[#5A7A70] text-xs">{dep.role}</p>
                  </div>
                  <span className="ml-auto text-xs bg-[#F0FAF7] text-[#1C3A32] px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                    {dep.seguro}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Google rating */}
        <div className="mt-12 flex flex-col items-center gap-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-[#3DFFC0] text-[#3DFFC0]" />
            ))}
          </div>
          <p className="font-bold text-[#1C3A32] text-lg">4.9 de 5 estrelas</p>
          <p className="text-[#5A7A70] text-sm">Baseado em +12.000 avaliações verificadas</p>
        </div>
      </div>
    </section>
  );
}
