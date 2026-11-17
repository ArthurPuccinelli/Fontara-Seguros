'use client'

import { useEffect, useState } from 'react'

// Preferência do apresentador: como abrir a assinatura embarcada.
// 'focused' = Focused View (só o documento + botão flutuante); 'classic' = tela clássica do DocuSign.
export type EmbedMode = 'focused' | 'classic'

const KEY = 'fontara_embed_mode'
const EVENT = 'fontara:embed-mode'

function read(): EmbedMode {
  try {
    return localStorage.getItem(KEY) === 'classic' ? 'classic' : 'focused'
  } catch {
    return 'focused'
  }
}

export function useEmbedMode(): [EmbedMode, (m: EmbedMode) => void] {
  const [mode, setMode] = useState<EmbedMode>('focused')

  useEffect(() => {
    setMode(read())
    const sync = () => setMode(read())
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  function update(m: EmbedMode) {
    try {
      localStorage.setItem(KEY, m)
    } catch {}
    setMode(m)
    window.dispatchEvent(new Event(EVENT))
  }

  return [mode, update]
}
