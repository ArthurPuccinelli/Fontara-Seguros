import Image from 'next/image';
import { Phone, Mail, MapPin, Instagram, Linkedin, Facebook } from 'lucide-react';

const links = {
  Seguros: [
    { label: 'Seguro Auto', href: '#auto' },
    { label: 'Seguro de Vida', href: '#vida' },
    { label: 'Seguro Empresarial', href: '#empresarial' },
  ],
  Empresa: [
    { label: 'Sobre Nós', href: '#' },
    { label: 'Carreiras', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Imprensa', href: '#' },
  ],
  Suporte: [
    { label: 'Central de Ajuda', href: '#' },
    { label: 'Sinistros', href: '#' },
    { label: 'Ouvidoria', href: '#' },
    { label: 'Política de Privacidade', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer id="contato" className="bg-[#0F211B] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-16 grid lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Image
              src="/logo.png"
              alt="Fontara Seguradora"
              width={140}
              height={44}
              className="h-10 w-auto object-contain brightness-0 invert mb-6"
            />
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              A Fontara é uma seguradora digital comprometida em simplificar a proteção de
              pessoas e empresas com tecnologia, transparência e humanidade.
            </p>

            <div className="mt-6 space-y-3">
              <a
                href="tel:08007070700"
                className="flex items-center gap-3 text-sm text-white/70 hover:text-[#3DFFC0] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#3DFFC0]" />
                0800 707 0700 (Gratuito 24h)
              </a>
              <a
                href="mailto:contato@fontaraseguros.com.br"
                className="flex items-center gap-3 text-sm text-white/70 hover:text-[#3DFFC0] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#3DFFC0]" />
                contato@fontaraseguros.com.br
              </a>
              <div className="flex items-start gap-3 text-sm text-white/60">
                <MapPin className="w-4 h-4 text-[#3DFFC0] mt-0.5 flex-shrink-0" />
                Av. Paulista, 1374 — São Paulo, SP
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              {[
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' },
                { icon: Facebook, href: '#', label: 'Facebook' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/08 hover:bg-[#3DFFC0]/20 flex items-center justify-center transition-colors group"
                >
                  <Icon className="w-4 h-4 text-white/60 group-hover:text-[#3DFFC0]" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-semibold text-sm text-white mb-4">{category}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-white/55 hover:text-[#3DFFC0] transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-xs">
            © 2025 Fontara Seguradora. CNPJ 00.000.000/0001-00 · Processo SUSEP 15414.001234/2010-00
          </p>
          <p className="text-white/40 text-xs">
            Todos os direitos reservados · Regulado pela SUSEP
          </p>
        </div>
      </div>
    </footer>
  );
}
