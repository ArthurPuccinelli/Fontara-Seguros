'use client'

import AgreementSearch from '@/components/AgreementSearch'

export default function ContratosPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-fontara-navy">Contratos</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">
        Repositório inteligente de acordos: busque por CPF/CNPJ, produto ou vencimento.
      </p>
      <AgreementSearch />
    </div>
  )
}
