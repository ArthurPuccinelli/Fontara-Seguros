'use client';

import { useState } from 'react';
import { ArrowRight, Car, Heart, Building2, CheckCircle2 } from 'lucide-react';

const tiposSeguro = [
  { id: 'auto', label: 'Auto', icon: Car },
  { id: 'vida', label: 'Vida', icon: Heart },
  { id: 'empresarial', label: 'Empresarial', icon: Building2 },
];

export default function CotacaoForm() {
  const [tipo, setTipo] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <section
      id="cotacao"
      className="py-24 bg-gradient-to-br from-[#0F211B] via-[#1C3A32] to-[#2A5445] relative overflow-hidden"
    >
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#3DFFC0]/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#3DFFC0]/[0.08] blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
            style={{
              background: 'rgba(61,255,192,0.15)',
              color: '#3DFFC0',
              border: '1px solid rgba(61,255,192,0.25)',
            }}
          >
            Cotação Gratuita
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            Solicite sua cotação agora
          </h2>
          <p className="text-white/65 mt-3 text-lg">
            Sem compromisso · Resposta em minutos · 100% seguro
          </p>
        </div>

        {submitted ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(61,255,192,0.25)',
            }}
          >
            <div className="w-16 h-16 rounded-full bg-[#3DFFC0]/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-9 h-9 text-[#3DFFC0]" />
            </div>
            <h3 className="text-white font-bold text-2xl mb-3">Cotação solicitada!</h3>
            <p className="text-white/70 max-w-md mx-auto">
              Recebemos sua solicitação. Um especialista da Fontara entrará em contato em até
              30 minutos pelo WhatsApp informado.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-8 inline-flex items-center gap-2 bg-[#3DFFC0] hover:bg-[#00D4A8] text-[#1C3A32] font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-md"
            >
              Fazer nova cotação
            </button>
          </div>
        ) : (
          <div
            className="rounded-2xl p-8 md:p-10"
            style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(61,255,192,0.20)',
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de Seguro */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">
                  Qual seguro você precisa? *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {tiposSeguro.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTipo(id)}
                      className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                        tipo === id
                          ? 'border-[#3DFFC0] bg-[#3DFFC0]/15 text-[#3DFFC0]'
                          : 'border-white/20 text-white/70 hover:border-white/40 hover:text-white'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid de campos */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-1.5">
                    Nome completo *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="João Silva"
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/35 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3DFFC0]/40 focus:border-[#3DFFC0]"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-1.5">
                    E-mail *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="joao@email.com"
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/35 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3DFFC0]/40 focus:border-[#3DFFC0]"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-1.5">
                    WhatsApp *
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="(11) 99999-9999"
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/35 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3DFFC0]/40 focus:border-[#3DFFC0]"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-1.5">
                    CPF / CNPJ *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="000.000.000-00"
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/35 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3DFFC0]/40 focus:border-[#3DFFC0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-1.5">
                  Observações (opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva suas necessidades específicas..."
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/35 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3DFFC0]/40 focus:border-[#3DFFC0] resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button
                  type="submit"
                  disabled={loading || !tipo}
                  className="flex-1 bg-[#3DFFC0] hover:bg-[#00D4A8] disabled:opacity-50 disabled:cursor-not-allowed text-[#1C3A32] font-bold py-4 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#1C3A32]/30 border-t-[#1C3A32] rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Solicitar Cotação Gratuita
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-white/45 text-xs text-center sm:text-left">
                  🔒 Seus dados estão<br />protegidos pela LGPD
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
