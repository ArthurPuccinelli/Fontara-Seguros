'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Save, CheckCircle, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function DadosCadastraisPage() {
  const { user, updateUser, logout } = useAuth()
  const router = useRouter()
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    address: '',
    birthDate: '',
  })

  useEffect(() => {
    if (!user) { router.replace('/area-cliente/login'); return }
    setForm({
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      phone: user.phone,
      address: user.address,
      birthDate: user.birthDate,
    })
  }, [user, router])

  if (!user) return null

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateUser(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function handleLogout() {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-fontara-navy shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/">
            <Image src="/logo.png" alt="Fontara Seguros" width={140} height={48} className="object-contain brightness-0 invert" priority />
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Back */}
        <button
          onClick={() => router.push('/area-cliente')}
          className="flex items-center gap-2 text-gray-500 hover:text-fontara-navy text-sm mb-6 transition"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h1 className="text-xl font-bold text-fontara-navy mb-1">Dados Cadastrais</h1>
          <p className="text-gray-500 text-sm mb-6">Atualize suas informações pessoais e de contato.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Nome completo</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fontara-navy/30 focus:border-fontara-navy transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fontara-navy/30 focus:border-fontara-navy transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Telefone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fontara-navy/30 focus:border-fontara-navy transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CPF</label>
                <input
                  name="cpf"
                  value={form.cpf}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data de nascimento</label>
                <input
                  name="birthDate"
                  type="date"
                  value={form.birthDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fontara-navy/30 focus:border-fontara-navy transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Endereço</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fontara-navy/30 focus:border-fontara-navy transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {saved && (
                <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                  <CheckCircle size={16} />
                  Dados salvos com sucesso!
                </span>
              )}
              {!saved && <span />}
              <button
                type="submit"
                className="flex items-center gap-2 bg-fontara-navy text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-fontara-navy/90 transition"
              >
                <Save size={15} />
                Salvar alterações
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
