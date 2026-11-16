import type { DemoProfile } from '@/types/demo'

// CPFs/CNPJ fictícios, porém com dígitos verificadores válidos.
export const DEFAULT_PROFILE: DemoProfile = {
  name: 'João Silva',
  email: 'cliente@fontara.com',
  cpf: '123.456.789-09',
  phone: '(11) 99999-9999',
  address: 'Av. Paulista, 1000 — São Paulo, SP',
  birthDate: '1985-06-15',
  pj: {
    cnpj: '11.222.333/0001-81',
    razaoSocial: 'Padaria Bom Pão Ltda',
    representantes: [
      { nome: 'João Silva', email: 'joao.silva@fontara.com', cpf: '123.456.789-09', phone: '(11) 99999-9999', cargo: 'Sócio-administrador' },
      { nome: 'Maria Souza', email: 'maria.souza@fontara.com', cpf: '529.982.240-59', phone: '(11) 98888-7777', cargo: 'Diretor' },
    ],
    testemunhas: [
      { nome: 'Carlos Pereira', email: 'carlos.pereira@fontara.com' },
      { nome: 'Ana Lima', email: 'ana.lima@fontara.com' },
    ],
  },
}

export function cloneDefaultProfile(): DemoProfile {
  return JSON.parse(JSON.stringify(DEFAULT_PROFILE)) as DemoProfile
}

// Mescla um objeto parcial (ex.: vindo do localStorage) com o padrão, garantindo todas as chaves.
export function normalizeProfile(raw: unknown): DemoProfile {
  const base = cloneDefaultProfile()
  if (!raw || typeof raw !== 'object') return base
  const r = raw as Partial<DemoProfile>
  const pj = (r.pj ?? {}) as Partial<DemoProfile['pj']>
  return {
    name: typeof r.name === 'string' ? r.name : base.name,
    email: typeof r.email === 'string' ? r.email : base.email,
    cpf: typeof r.cpf === 'string' ? r.cpf : base.cpf,
    phone: typeof r.phone === 'string' ? r.phone : base.phone,
    address: typeof r.address === 'string' ? r.address : base.address,
    birthDate: typeof r.birthDate === 'string' ? r.birthDate : base.birthDate,
    pj: {
      cnpj: typeof pj.cnpj === 'string' ? pj.cnpj : base.pj.cnpj,
      razaoSocial: typeof pj.razaoSocial === 'string' ? pj.razaoSocial : base.pj.razaoSocial,
      representantes: Array.isArray(pj.representantes) && pj.representantes.length ? pj.representantes : base.pj.representantes,
      testemunhas: Array.isArray(pj.testemunhas) ? pj.testemunhas : base.pj.testemunhas,
    },
  }
}
