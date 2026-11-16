// "CRM" simulado do canal: CPF/CNPJ -> nome da parte, como o sistema da seguradora conhece o cliente.
// Usado para buscar no Agreement Manager por CPF/CNPJ quando o documento não tem extração customizada
// desse campo (a IA do Navigator extrai partes, datas e valores por padrão).
// Fonte: docs/demos/assets/legados/INDEX.md (contratos legados fictícios).
const CLIENTES: Record<string, string> = {
  '31827465964': 'Helena Marquesa Vasconcelos Demo',
  '52739184050': 'Otávio Brandão Linhares Demo',
  '26481093740': 'Cecília Montenegro Duarte Demo',
  '87315026444': 'Raimundo Tavares Peixoto Demo',
  '40592618315': 'Lívia Cavalcanti Rezende Demo',
  '69027451885': 'Joaquim Esteves Barroso Demo',
  '12485937000183': 'Metalúrgica Vale Imaginário Demo Ltda',
  '30761248000136': 'Construtora Horizonte Azul Demo S.A.',
  '55318076000151': 'Laticínios Serra Encantada Demo Ltda',
  '21947683000169': 'Tecnologia Rio Nublado Demo S.A.',
  '08264519000199': 'Agroindustrial Campos do Sul Demo Ltda',
  '37620481000148': 'Correspondente Praça Nova Demo Serviços Financeiros Ltda',
}

export const normalizeName = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

export function nomePorDocumento(doc: string): string | undefined {
  return CLIENTES[doc.replace(/\D/g, '')]
}

export function documentoPorNome(nome: string): string | undefined {
  const n = normalizeName(nome)
  const hit = Object.entries(CLIENTES).find(([, v]) => normalizeName(v) === n)
  if (!hit) return undefined
  const d = hit[0]
  return d.length === 11
    ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}
