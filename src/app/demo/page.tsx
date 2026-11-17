import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, AlertCircle, Eye, Boxes } from 'lucide-react'

const steps = [
  {
    code: 'V1',
    title: 'Proposta de adesão — formulário do portal (API)',
    dor: 'Dezenas de formulários manuais (POPs) por produto, com retrabalho e erros de preenchimento.',
    mostrar: 'Formulário nativo com lógica condicional (PF/PJ, representantes, testemunhas, beneficiários). Ao enviar, o payload JSON vai para a API e o documento é gerado e enviado para assinatura. Abra o painel "Ver payload enviado à API" para o time de TI.',
    produto: 'Workflow Builder + Doc Gen + eSignature (via API)',
    href: '/canal/nova-jornada/proposta',
    cta: 'Abrir (Portal do Canal)',
  },
  {
    code: 'V2',
    title: 'Mesma proposta PF/PJ — experiência DocuSign embarcada',
    dor: 'Cada mudança de POP exige novo desenvolvimento de tela e fila na TI.',
    mostrar: 'A mesma proposta PF/PJ renderizada direto do Workflow Builder (Web Form + ramificação PF/PJ + Doc Gen + assinatura) dentro do portal: alterar o POP é alterar o workflow, sem deploy. Compare com o 1A.',
    produto: 'Workflow Builder (embedded) + Web Forms',
    href: '/canal/nova-jornada/proposta?modo=embarcado',
    cta: 'Abrir (Portal do Canal)',
  },
  {
    code: 'C1',
    title: 'Resgate / Portabilidade — Web Form + assinatura',
    dor: 'O cliente precisa imprimir, assinar e enviar formulários de resgate ou portabilidade.',
    mostrar: 'Web Form dinâmico pré-preenchido com os dados do cliente; ao enviar, segue direto para assinatura em Focused View.',
    produto: 'Web Forms + eSignature (Focused View)',
    href: '/area-cliente',
    cta: 'Abrir (Área do Cliente)',
  },
  {
    code: 'C4',
    title: 'Contratação com assinatura pelo WhatsApp',
    dor: 'Cliente desiste no meio da contratação: e-mail não chega, link se perde, precisa de computador.',
    mostrar: 'Na Área do Cliente, escolha um plano e confirme o celular: a proposta chega no WhatsApp e é assinada pelo telefone. A trilha na tela avança sozinha (enviada → aberta → assinada). Também no Portal do Canal (POP-VP-002).',
    produto: 'eSignature API + entrega por WhatsApp',
    href: '/area-cliente',
    cta: 'Abrir (Área do Cliente)',
  },
  {
    code: 'H1',
    title: 'Cotação com assinatura no site (eSignature API)',
    dor: 'Propostas impressas ou enviadas por e-mail atrasam o fechamento.',
    mostrar: 'Formulário da home gera o documento pela API e o cliente assina sem sair do site. Alterne Focused View ⇄ Clássica no seletor discreto da janela de assinatura.',
    produto: 'eSignature API + assinatura embarcada (Docusign JS)',
    href: '/#cotacao',
    cta: 'Abrir (Home)',
  },
  {
    code: 'V3',
    title: 'Acompanhamento em tempo real',
    dor: 'Falta de visibilidade: ninguém sabe em que etapa está cada proposta ou quem ainda não assinou.',
    mostrar: 'Painel com instâncias do workflow e envelopes, com linha do tempo de status e atualização automática a cada 15 s.',
    produto: 'Workflow Builder (instâncias) + eSignature (envelopes)',
    href: '/canal/acompanhamento',
    cta: 'Abrir (Portal do Canal)',
  },
  {
    code: 'V4',
    title: 'Contratos inteligentes (extração por IA)',
    dor: 'Contratos assinados ficam em pastas e e-mails; vencimentos passam despercebidos.',
    mostrar: 'Busca por CPF/CNPJ e filtros "vence em 30/60/90 dias" sobre campos extraídos por IA (Iris), com destaque para vencimentos próximos.',
    produto: 'Docusign IAM — Navigator + Iris',
    href: '/canal/contratos',
    cta: 'Abrir (Portal do Canal)',
  },
  {
    code: 'D2',
    title: 'Perguntar em linguagem natural (Docusign MCP / WhatsApp)',
    dor: 'Para saber algo de um contrato é preciso abrir sistemas e filtrar telas.',
    mostrar: 'Fora do portal: no Claude com o conector Docusign, pergunte sobre o acervo em linguagem natural (ex.: contratos de um CNPJ que vencem em 90 dias).',
    produto: 'Docusign MCP + Navigator',
    href: '/demo-map',
    cta: 'Ver no mapa',
  },
]

export const metadata = { title: 'Roteiro da demo — Fontara Seguros', robots: { index: false, follow: false } }

export default function DemoHub() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-br from-fontara-navy via-[#1a3a6e] to-fontara-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <Image src="/logo.png" alt="Fontara Seguros" width={140} height={48} className="object-contain brightness-0 invert mb-6" priority />
          <span className="text-fontara-amber text-xs font-semibold uppercase tracking-widest">Roteiro da demo</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-1">Do POP ao acordo inteligente</h1>
          <p className="text-white/70 mt-3 max-w-2xl text-sm leading-relaxed">
            Vida e previdência: de formulários manuais a jornadas digitais, assinatura e contratos pesquisáveis.
            Página de apoio do apresentador. Antes de começar, faça login no Portal do Canal (qualquer e-mail/senha) e
            configure <Link href="/area-cliente/perfil" className="underline">seus dados de demo</Link> (e-mail e celular recebem a assinatura).
          </p>
          <a href="/demo-map" className="inline-block mt-4 text-sm font-semibold text-fontara-amber underline">
            Abrir o mapa completo da demo (falas, IDs e checklist)
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-5">
        {steps.map((s) => (
          <article key={s.code} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row gap-5">
            <div className="shrink-0 w-14 h-14 rounded-xl bg-fontara-navy text-fontara-amber font-bold text-xl flex items-center justify-center">{s.code}</div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-fontara-navy text-lg mb-3">{s.title}</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <dt className="shrink-0 text-red-600 flex items-center gap-1 font-semibold w-36"><AlertCircle size={14} /> Dor do cliente</dt>
                  <dd className="text-gray-600">{s.dor}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="shrink-0 text-fontara-accent flex items-center gap-1 font-semibold w-36"><Eye size={14} /> O que mostrar</dt>
                  <dd className="text-gray-600">{s.mostrar}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="shrink-0 text-purple-700 flex items-center gap-1 font-semibold w-36"><Boxes size={14} /> Produto</dt>
                  <dd className="text-gray-600">{s.produto}</dd>
                </div>
              </dl>
            </div>
            <div className="sm:self-center shrink-0">
              <Link href={s.href} className="inline-flex items-center gap-2 bg-fontara-navy text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-fontara-navy/90 transition whitespace-nowrap">
                {s.cta} <ArrowRight size={15} />
              </Link>
            </div>
          </article>
        ))}
      </main>
    </div>
  )
}
