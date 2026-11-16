// Contratos compartilhados entre UI e rotas API das demos DocuSign.

export interface Pessoa {
  nome: string
  email: string
  cpf?: string
  phone?: string
  cargo?: string // ex.: Sócio-administrador, Procurador
}

export interface DemoProfilePJ {
  cnpj: string
  razaoSocial: string
  representantes: Pessoa[] // 1..3
  testemunhas: Pessoa[] // 0..2
}

// Perfil de demo salvo no navegador (localStorage) e usado para pré-preencher todas as demos.
export interface DemoProfile {
  name: string
  email: string
  cpf: string
  phone: string
  address: string
  birthDate: string
  pj: DemoProfilePJ
}

export type Persona = 'cliente' | 'vendedor'

export type JourneyMode = 'api' | 'embedded-workflow' | 'embedded-webform'

export interface Journey {
  slug: string
  popCode: string // código do POP/formulário manual que a jornada substitui
  title: string
  description: string
  persona: Persona
  modes: JourneyMode[]
  publico: ('PF' | 'PJ')[]
  produtos: string[] // produtos DocuSign demonstrados
  workflowId?: string // Workflow Builder (Maestro) — modo api / embedded-workflow
  embeddedWorkflowId?: string // workflow com etapa de Web Form (modo embedded-workflow)
  formId?: string // Web Form — modo embedded-webform
}

// ---- API: POST /api/docusign/maestro ----
export type TriggerInputValue = string | number | boolean
export interface MaestroTriggerRequest {
  workflowId?: string
  journey?: string // slug do catálogo, alternativa ao workflowId
  inputs?: Record<string, TriggerInputValue>
  mode?: JourneyMode // 'embedded-workflow' => usa journey.embeddedWorkflowId
}
export interface MaestroTriggerResponse {
  instanceId?: string
  embeddedUrl?: string
  demo?: boolean
  message?: string
  error?: string
}

// ---- API: GET /api/docusign/maestro/instances?workflowId=&journey= ----
export interface InstanceSummary {
  id: string
  name: string
  workflowId: string
  workflowName?: string
  status: string // In Progress | Completed | Canceled | Failed ...
  startedAt?: string
  endedAt?: string
  currentStep?: string
  startedBy?: string
}
export interface InstancesResponse {
  instances: InstanceSummary[]
  demo?: boolean
  error?: string
}

// ---- API: GET /api/docusign/envelopes?days=7 ----
export interface EnvelopeSummary {
  envelopeId: string
  subject: string
  status: string
  sentAt?: string
  completedAt?: string
  recipients?: { name: string; email: string; role?: string; status: string }[]
}
export interface EnvelopesResponse {
  envelopes: EnvelopeSummary[]
  demo?: boolean
  error?: string
}

// ---- API: POST /api/docusign/webforms/instance ----
export interface WebFormInstanceRequest {
  formId?: string
  journey?: string
  clientUserId: string
  formValues?: Record<string, string | number | boolean | string[]>
  returnUrl?: string
}
export interface WebFormInstanceResponse {
  instanceId?: string
  instanceUrl?: string
  instanceToken?: string
  demo?: boolean
  message?: string
  error?: string
}

// ---- API: POST /api/docusign/signing-view ----
export interface SigningViewRequest {
  envelopeId: string
  name: string
  email: string
  clientUserId: string
  returnUrl: string
  frameAncestors?: string[]
}
export interface SigningViewResponse {
  url?: string
  demo?: boolean
  error?: string
}

// ---- API: GET /api/docusign/agreements?cpfCnpj=&expiringInDays=&q= ----
export interface AgreementSummary {
  id: string
  title: string
  type?: string
  status?: string
  parties: string[]
  cpfCnpj?: string
  produto?: string
  effectiveDate?: string
  expirationDate?: string
  value?: number
  source?: string
}
export interface AgreementsResponse {
  agreements: AgreementSummary[]
  demo?: boolean
  error?: string
}
