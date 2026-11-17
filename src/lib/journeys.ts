import type { Journey } from '@/types/demo'

// Catálogo de jornadas (POPs digitalizados). Adicionar um POP = nova entrada aqui,
// apontando para um workflow do Workflow Builder ou um Web Form — sem código novo.
// IDs vazios => a rota responde em demo mode.
export const JOURNEYS: Journey[] = [
  {
    slug: 'proposta',
    popCode: 'POP-VP-001',
    title: 'Proposta de Adesão Vida e Previdência',
    description: 'Adesão PF ou PJ com representantes legais, procuradores e testemunhas. Documento gerado automaticamente e enviado para assinatura.',
    persona: 'vendedor',
    modes: ['api', 'embedded-workflow'],
    publico: ['PF', 'PJ'],
    produtos: ['Workflow Builder', 'Doc Gen', 'eSignature'],
    workflowId: '824dd961-5586-4eea-b3af-52d2c3e927f9', // Fontara Seguros - Proposta PF/PJ (API)
    embeddedWorkflowId: '0359ae48-47dc-45be-a7b8-9ae20894eaba', // Fontara Seguros - Onboarding de cliente portal (Web Form + ramificações + Doc Gen)
  },
  {
    slug: 'contratacao-whatsapp',
    popCode: 'POP-VP-002',
    title: 'Contratação com assinatura pelo WhatsApp',
    description: 'O cliente escolhe o plano e recebe a proposta no WhatsApp para assinar pelo celular, sem e-mail e sem app.',
    persona: 'cliente',
    modes: ['whatsapp'],
    publico: ['PF'],
    produtos: ['eSignature API', 'Entrega por WhatsApp'],
  },
  {
    slug: 'resgate-portabilidade',
    popCode: 'POP-VP-014',
    title: 'Solicitação de Resgate / Portabilidade',
    description: 'Formulário dinâmico: resgate total, parcial ou portabilidade para outra entidade, com assinatura na sequência.',
    persona: 'cliente',
    modes: ['embedded-webform'],
    publico: ['PF'],
    produtos: ['Web Forms', 'eSignature (Focused View)'],
    formId: 'b5a06678-688d-4243-952f-f0dccb9a19c7',
  },
  {
    slug: 'atualizacao-cadastral',
    popCode: 'POP-CAD-003',
    title: 'Atualização Cadastral',
    description: 'Atualização de dados com integração ao CRM via Workflow Builder.',
    persona: 'cliente',
    modes: ['embedded-workflow'],
    publico: ['PF'],
    produtos: ['Workflow Builder', 'Web Forms', 'App Center'],
    embeddedWorkflowId: '98e2f24c-e903-4692-b599-21fd8214e04e',
  },
]

export function getJourney(slug: string): Journey | undefined {
  return JOURNEYS.find((j) => j.slug === slug)
}
