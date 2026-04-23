import { ClipboardList, Search, FileCheck, HeartHandshake } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: ClipboardList,
    title: 'Preencha o formulário',
    description:
      'Informe seus dados e o tipo de cobertura. O processo leva menos de 2 minutos e é 100% online.',
  },
  {
    number: '02',
    icon: Search,
    title: 'Receba sua cotação',
    description:
      'Nossa tecnologia analisa as melhores opções e apresenta a cotação mais adequada para o seu perfil.',
  },
  {
    number: '03',
    icon: FileCheck,
    title: 'Assine digitalmente',
    description:
      'Contratação 100% digital com assinatura eletrônica segura. Sem burocracia, sem papelada.',
  },
  {
    number: '04',
    icon: HeartHandshake,
    title: 'Fique protegido',
    description:
      'Apólice ativa imediatamente. Nosso time fica disponível 24h para qualquer necessidade.',
  },
];

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="py-24 bg-[#F7FDFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <span className="badge">Como Funciona</span>
            <h2 className="section-title mt-4">
              Contrate seu seguro em
              <span className="text-[#1C3A32]"> 4 passos simples</span>
            </h2>
            <p className="section-subtitle max-w-md">
              Processo 100% digital, sem burocracia e com aprovação imediata. Do formulário
              à apólice em questão de minutos.
            </p>

            <div className="mt-8 flex gap-4">
              <a href="#cotacao" className="btn-dark">
                Começar Agora
              </a>
              <a href="tel:08007070700" className="btn-ghost">
                Falar com Especialista
              </a>
            </div>
          </div>

          {/* Right: Steps */}
          <div className="space-y-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="flex gap-5 bg-white rounded-2xl p-6 border border-[#D4EDE6] hover:border-[#3DFFC0] hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-[#F0FAF7] group-hover:bg-[#3DFFC0]/20 flex items-center justify-center transition-colors relative">
                      <Icon className="w-5 h-5 text-[#1C3A32]" />
                      <span className="absolute -top-2 -right-2 bg-[#1C3A32] text-[#3DFFC0] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {idx + 1}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1C3A32] mb-1">{step.title}</h3>
                    <p className="text-sm text-[#5A7A70] leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
