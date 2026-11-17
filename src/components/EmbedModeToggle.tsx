'use client'

import { useEmbedMode, type EmbedMode } from '@/lib/embedMode'

const OPTIONS: { value: EmbedMode; label: string }[] = [
  { value: 'focused', label: 'Focused View' },
  { value: 'classic', label: 'Clássica' },
]

// Seletor discreto para o apresentador alternar o formato da assinatura embarcada.
export default function EmbedModeToggle({ className = '' }: { className?: string }) {
  const [mode, setMode] = useEmbedMode()
  return (
    <div className={`inline-flex items-center gap-1.5 text-[11px] text-gray-400 ${className}`} role="radiogroup" aria-label="Formato da assinatura embarcada">
      <span>Assinatura:</span>
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={mode === o.value}
          onClick={() => setMode(o.value)}
          className={`px-1.5 py-0.5 rounded transition ${mode === o.value ? 'bg-gray-100 text-gray-600 font-medium' : 'hover:text-gray-600'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
