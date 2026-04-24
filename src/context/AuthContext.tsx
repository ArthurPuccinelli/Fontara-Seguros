'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  name: string
  email: string
  cpf: string
  phone: string
  address: string
  birthDate: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => boolean
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const DEMO_USER: User = {
  name: 'João Silva',
  email: 'cliente@fontara.com',
  cpf: '123.456.789-00',
  phone: '(11) 99999-9999',
  address: 'Av. Paulista, 1000 — São Paulo, SP',
  birthDate: '1985-06-15',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('fontara_user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  function login(email: string, password: string): boolean {
    if (!email || !password) return false
    const userData = { ...DEMO_USER, email }
    setUser(userData)
    localStorage.setItem('fontara_user', JSON.stringify(userData))
    return true
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('fontara_user')
  }

  function updateUser(data: Partial<User>) {
    if (!user) return
    const updated = { ...user, ...data }
    setUser(updated)
    localStorage.setItem('fontara_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
