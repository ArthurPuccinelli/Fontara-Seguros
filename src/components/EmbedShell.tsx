'use client'

import { X } from 'lucide-react'

// Moldura mínima para experiências DocuSign embarcadas: sem título nem cabeçalho,
// só a borda na cor do site e o botão de fechar do lado de fora.
export default function EmbedShell({ onClose, label, children }: { onClose: () => void; label: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={label}>
      <div className="relative w-full max-w-4xl h-[88vh] bg-white rounded-xl border-2 border-fontara-navy shadow-2xl">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-fontara-navy text-white flex items-center justify-center shadow-md hover:bg-fontara-blue transition"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
        <div className="h-full overflow-y-auto rounded-[10px]">{children}</div>
      </div>
    </div>
  )
}
