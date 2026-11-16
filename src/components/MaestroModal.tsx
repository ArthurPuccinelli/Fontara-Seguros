'use client'

import { useCallback } from 'react'
import DocusignEmbedModal from './DocusignEmbedModal'
import { useAuth } from '@/context/AuthContext'
import type { MaestroTriggerResponse } from '@/types/demo'

interface Props {
  onClose: () => void
  workflowId?: string
}

export default function MaestroModal({ onClose, workflowId }: Props) {
  const { user } = useAuth()

  const start = useCallback(async () => {
    const body: Record<string, unknown> = workflowId ? { workflowId } : {}
    if (user) {
      body.inputs = {
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        phone: user.phone,
        address: user.address,
      }
    }
    const res = await fetch('/api/docusign/maestro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = (await res.json()) as MaestroTriggerResponse & { consentUrl?: string }
    return { url: data.embeddedUrl, demo: data.demo, message: data.message, error: data.error, consentUrl: data.consentUrl }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <DocusignEmbedModal title="DocuSign Maestro" subtitle="Fluxo com Workflow Builder" onClose={onClose} start={start} />
}
