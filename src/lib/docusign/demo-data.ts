// Respostas simuladas (demo mode) — dados fictícios, datas relativas a hoje.
import type { AgreementSummary, EnvelopeSummary, InstanceSummary } from '@/types/demo'

const DAY = 86400000
const iso = (offsetDays: number, hour = 10) => {
  const d = new Date(Date.now() + offsetDays * DAY)
  d.setHours(hour, 15, 0, 0)
  return d.toISOString()
}
const date = (offsetDays: number) => iso(offsetDays).slice(0, 10)

export const DEMO_MESSAGE = '(Modo demo) Configure as variáveis de ambiente DocuSign e os IDs da jornada para usar a API real.'

export function demoInstanceId(): string {
  return `DEMO-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function demoInstances(workflowId = 'demo-workflow', workflowName = 'Proposta de Adesão Vida e Previdência'): InstanceSummary[] {
  return [
    { id: 'demo-inst-001', name: 'Adesão PF — Mariana Albuquerque', workflowId, workflowName, status: 'In Progress', startedAt: iso(-0.1), currentStep: 'Assinatura do proponente', startedBy: 'Carlos Menezes (Corretor)' },
    { id: 'demo-inst-002', name: 'Adesão PJ — Padaria Bom Grão Ltda', workflowId, workflowName, status: 'In Progress', startedAt: iso(-1), currentStep: 'Assinatura dos representantes legais (1/2)', startedBy: 'Carlos Menezes (Corretor)' },
    { id: 'demo-inst-003', name: 'Adesão PF — Rafael Teixeira', workflowId, workflowName, status: 'Completed', startedAt: iso(-2, 9), endedAt: iso(-2, 15), currentStep: 'Integração CRM', startedBy: 'Juliana Prado (Corretora)' },
    { id: 'demo-inst-004', name: 'Atualização cadastral — Beatriz Nogueira', workflowId, workflowName, status: 'Completed', startedAt: iso(-3, 11), endedAt: iso(-3, 12), currentStep: 'Atualização no CRM', startedBy: 'Beatriz Nogueira' },
    { id: 'demo-inst-005', name: 'Adesão PJ — TecnoSul Engenharia S.A.', workflowId, workflowName, status: 'Canceled', startedAt: iso(-5), endedAt: iso(-4), currentStep: 'Validação de poderes', startedBy: 'Juliana Prado (Corretora)' },
    { id: 'demo-inst-006', name: 'Resgate parcial — Eduardo Lima', workflowId, workflowName, status: 'Failed', startedAt: iso(-6), endedAt: iso(-6, 11), currentStep: 'Consulta de saldo', startedBy: 'Eduardo Lima' },
  ]
}

export function demoEnvelopes(): EnvelopeSummary[] {
  return [
    { envelopeId: 'demo-env-001', subject: 'Fontara Seguros — Proposta de Adesão Vida PF', status: 'sent', sentAt: iso(-0.1), recipients: [{ name: 'Mariana Albuquerque', email: 'mariana.albuquerque@exemplo.com.br', role: 'Proponente', status: 'delivered' }] },
    { envelopeId: 'demo-env-002', subject: 'Fontara Seguros — Proposta de Adesão Previdência PJ', status: 'sent', sentAt: iso(-1), recipients: [
      { name: 'Roberto Siqueira', email: 'roberto@bomgrao.com.br', role: 'Sócio-administrador', status: 'completed' },
      { name: 'Ana Siqueira', email: 'ana@bomgrao.com.br', role: 'Sócia', status: 'sent' },
      { name: 'Paulo Ramos', email: 'paulo.ramos@exemplo.com.br', role: 'Testemunha', status: 'created' },
    ] },
    { envelopeId: 'demo-env-003', subject: 'Fontara Seguros — Proposta de Seguro de Vida', status: 'completed', sentAt: iso(-2, 9), completedAt: iso(-2, 14), recipients: [{ name: 'Rafael Teixeira', email: 'rafael.teixeira@exemplo.com.br', role: 'Proponente', status: 'completed' }] },
    { envelopeId: 'demo-env-004', subject: 'Fontara Seguros — Solicitação de Portabilidade', status: 'completed', sentAt: iso(-4), completedAt: iso(-4, 16), recipients: [{ name: 'Luciana Ferraz', email: 'luciana.ferraz@exemplo.com.br', role: 'Participante', status: 'completed' }] },
    { envelopeId: 'demo-env-005', subject: 'Fontara Seguros — Proposta Empresarial', status: 'declined', sentAt: iso(-5), recipients: [{ name: 'Marcos Vieira', email: 'marcos@tecnosul.com.br', role: 'Diretor', status: 'declined' }] },
  ]
}

export function demoAgreements(): AgreementSummary[] {
  return [
    { id: 'demo-agr-01', title: 'Apólice Vida Individual nº 1023-4471', type: 'Apólice de Seguro de Vida', status: 'COMPLETE', parties: ['Fontara Seguros S.A.', 'Mariana Albuquerque'], cpfCnpj: '123.456.789-09', produto: 'Vida Individual', effectiveDate: date(-335), expirationDate: date(30), value: 250000, source: 'Docusign eSign' },
    { id: 'demo-agr-02', title: 'Plano PGBL Fontara Futuro — Certificado 88213', type: 'Contrato de Previdência', status: 'COMPLETE', parties: ['Fontara Previdência S.A.', 'Rafael Teixeira'], cpfCnpj: '987.654.321-00', produto: 'PGBL', effectiveDate: date(-1400), expirationDate: date(4075), value: 180000, source: 'Docusign eSign' },
    { id: 'demo-agr-03', title: 'Apólice Vida em Grupo — Padaria Bom Grão Ltda', type: 'Apólice de Seguro de Vida em Grupo', status: 'COMPLETE', parties: ['Fontara Seguros S.A.', 'Padaria Bom Grão Ltda'], cpfCnpj: '12.345.678/0001-95', produto: 'Vida em Grupo', effectiveDate: date(-300), expirationDate: date(65), value: 1200000, source: 'Docusign eSign' },
    { id: 'demo-agr-04', title: 'Previdência Empresarial VGBL — TecnoSul Engenharia S.A.', type: 'Contrato de Previdência Empresarial', status: 'COMPLETE', parties: ['Fontara Previdência S.A.', 'TecnoSul Engenharia S.A.'], cpfCnpj: '45.678.901/0001-23', produto: 'VGBL Empresarial', effectiveDate: date(-700), expirationDate: date(395), value: 3500000, source: 'Docusign CLM' },
    { id: 'demo-agr-05', title: 'Apólice Acidentes Pessoais nº 5532-0098', type: 'Apólice de Acidentes Pessoais', status: 'COMPLETE', parties: ['Fontara Seguros S.A.', 'Beatriz Nogueira'], cpfCnpj: '321.654.987-11', produto: 'Acidentes Pessoais', effectiveDate: date(-355), expirationDate: date(10), value: 100000, source: 'Docusign eSign' },
    { id: 'demo-agr-06', title: 'Apólice Vida Individual nº 1029-7710', type: 'Apólice de Seguro de Vida', status: 'COMPLETE', parties: ['Fontara Seguros S.A.', 'Eduardo Lima'], cpfCnpj: '456.789.123-45', produto: 'Vida Individual', effectiveDate: date(-280), expirationDate: date(85), value: 500000, source: 'Docusign eSign' },
    { id: 'demo-agr-07', title: 'Plano VGBL Fontara Renda — Certificado 90341', type: 'Contrato de Previdência', status: 'COMPLETE', parties: ['Fontara Previdência S.A.', 'Luciana Ferraz'], cpfCnpj: '159.753.486-20', produto: 'VGBL', effectiveDate: date(-900), expirationDate: date(2750), value: 320000, source: 'Upload manual' },
    { id: 'demo-agr-08', title: 'Apólice Prestamista — Comercial Andrade & Filhos Ltda', type: 'Apólice Prestamista', status: 'COMPLETE', parties: ['Fontara Seguros S.A.', 'Comercial Andrade & Filhos Ltda'], cpfCnpj: '23.456.789/0001-10', produto: 'Prestamista PJ', effectiveDate: date(-340), expirationDate: date(25), value: 750000, source: 'Docusign eSign' },
    { id: 'demo-agr-09', title: 'Apólice Vida em Grupo — Clínica Saúde Integral S/S', type: 'Apólice de Seguro de Vida em Grupo', status: 'PENDING', parties: ['Fontara Seguros S.A.', 'Clínica Saúde Integral S/S'], cpfCnpj: '34.567.890/0001-44', produto: 'Vida em Grupo', effectiveDate: date(-200), expirationDate: date(165), value: 980000, source: 'Docusign eSign' },
    { id: 'demo-agr-10', title: 'Apólice Vida Individual nº 0998-1204 (vencida)', type: 'Apólice de Seguro de Vida', status: 'INACTIVE', parties: ['Fontara Seguros S.A.', 'Marcos Vieira'], cpfCnpj: '741.852.963-07', produto: 'Vida Individual', effectiveDate: date(-380), expirationDate: date(-15), value: 200000, source: 'Docusign eSign' },
  ]
}
