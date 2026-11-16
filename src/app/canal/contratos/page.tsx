'use client'

import { MessageSquare, Sparkles } from 'lucide-react'
import AgreementSearch from '@/components/AgreementSearch'

export default function ContratosPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-fontara-navy">Contratos</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">
        Repositório inteligente de acordos: busque por CPF/CNPJ, produto ou vencimento.
      </p>

      <div className="bg-gradient-to-r from-fontara-navy to-fontara-mid rounded-xl p-5 text-white mb-6 flex flex-col sm:flex-row gap-4 sm:items-center">
        <div className="p-3 bg-white/10 rounded-lg shrink-0 self-start">
          <MessageSquare size={22} className="text-fontara-amber" />
        </div>
        <div>
          <h2 className="font-semibold text-sm flex items-center gap-2">
            Pergunte em linguagem natural via Docusign MCP / WhatsApp <Sparkles size={14} className="text-fontara-amber" />
          </h2>
          <p className="text-white/70 text-xs mt-1 leading-relaxed max-w-3xl">
            Os mesmos dados extraídos por IA (Iris) ficam disponíveis para assistentes via Docusign MCP. Em vez de filtrar telas, o
            corretor pergunta no WhatsApp: &ldquo;quais contratos de previdência da Padaria Bom Pão vencem nos próximos 60 dias?&rdquo; e recebe a resposta com
            link para o documento.
          </p>
        </div>
      </div>

      <AgreementSearch />
    </div>
  )
}
