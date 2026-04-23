import Image from 'next/image'
import { Phone, Mail, MapPin, Instagram, Linkedin, Facebook } from 'lucide-react'

const links = {
  seguros: [
    { label: 'Seguro de Vida', href: '#seguros' },
    { label: 'Seguro Auto', href: '#seguros' },
    { label: 'Seguro Residencial', href: '#seguros' },
    { label: 'Seguro Empresarial', href: '#seguros' },
    { label: 'Seguro Saúde', href: '#seguros' },
    { label: 'Seguro Viagem', href: '#seguros' },
  ],
  empresa: [
    { label: 'Sobre nós', href: '#' },
    { label: 'Diferenciais', href: '#diferenciais' },
    { label: 'Depoimentos', href: '#depoimentos' },
    { label: 'Trabalhe conosco', href: '#' },
    { label: 'Parceiros', href: '#' },
  ],
  suporte: [
    { label: 'Central de ajuda', href: '#' },
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Política de privacidade', href: '#' },
    { label: 'Termos de uso', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-fontara-navy pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/logo.png"
              alt="Fontara Seguros"
              width={140}
              height={48}
              className="object-contain mb-4"
            />
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Protegendo o que importa para você há mais de 15 anos. Soluções completas em seguros
              para pessoas e empresas.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Facebook, href: '#' },
              ].map(({ icon: Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:bg-fontara-gold/20 hover:text-fontara-amber transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Seguros */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Seguros</h4>
            <ul className="space-y-2.5">
              {links.seguros.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-white/50 hover:text-fontara-amber text-sm transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Empresa</h4>
            <ul className="space-y-2.5">
              {links.empresa.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-white/50 hover:text-fontara-amber text-sm transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Contato</h4>
            <ul className="space-y-3">
              <li>
                <a href="tel:+551130000000" className="flex items-center gap-2 text-white/50 hover:text-fontara-amber text-sm transition-colors">
                  <Phone size={14} /> (11) 3000-0000
                </a>
              </li>
              <li>
                <a href="mailto:contato@fontaraseguros.com.br" className="flex items-center gap-2 text-white/50 hover:text-fontara-amber text-sm transition-colors">
                  <Mail size={14} /> contato@fontaraseguros.com.br
                </a>
              </li>
              <li className="flex items-start gap-2 text-white/50 text-sm">
                <MapPin size={14} className="shrink-0 mt-0.5" />
                <span>Av. Paulista, 1000 — São Paulo, SP</span>
              </li>
            </ul>

            <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white/40 text-xs mb-1">Atendimento</p>
              <p className="text-fontara-amber text-sm font-semibold">24h / 7 dias por semana</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Fontara Seguros. Todos os direitos reservados.
          </p>
          <p className="text-white/20 text-xs">
            Corretora registrada na SUSEP · CNPJ 00.000.000/0001-00
          </p>
        </div>
      </div>
    </footer>
  )
}
