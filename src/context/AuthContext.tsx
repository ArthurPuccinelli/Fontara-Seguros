'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { DemoProfile, Persona } from '@/types/demo'
import { cloneDefaultProfile, normalizeProfile } from '@/lib/defaultProfile'

export type User = DemoProfile

interface AuthContextType {
  // Perfil de demo quando há sessão ativa; null quando deslogado.
  user: DemoProfile | null
  // Perfil de demo sempre disponível (mesmo deslogado), salvo separadamente da sessão.
  profile: DemoProfile
  persona: Persona
  // e-mail usado no login (sessão atual)
  sessionEmail: string | null
  // true após ler o localStorage — use nos guards para não redirecionar antes da hidratação.
  ready: boolean
  login: (email: string, password: string, persona?: Persona) => boolean
  logout: () => void
  updateUser: (data: Partial<DemoProfile>) => void
  saveProfile: (profile: DemoProfile) => void
  resetProfile: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const PROFILE_KEY = 'fontara_demo_profile'
const SESSION_KEY = 'fontara_session'
const LEGACY_KEY = 'fontara_user'

function readJSON(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* localStorage indisponível */
  }
}

function removeKey(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* localStorage indisponível */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<DemoProfile>(cloneDefaultProfile)
  const [session, setSession] = useState<{ persona: Persona; email: string } | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let loadedProfile: DemoProfile | null = null
    const stored = readJSON(PROFILE_KEY)
    if (stored) loadedProfile = normalizeProfile(stored)

    let loadedSession: { persona: Persona; email: string } | null = null
    const s = readJSON(SESSION_KEY) as { persona?: string; email?: string } | null
    if (s && (s.persona === 'cliente' || s.persona === 'vendedor') && typeof s.email === 'string') {
      loadedSession = { persona: s.persona, email: s.email }
    }

    // Migração da chave antiga (fontara_user)
    const legacy = readJSON(LEGACY_KEY)
    if (legacy && typeof legacy === 'object') {
      if (!loadedProfile) {
        loadedProfile = normalizeProfile(legacy)
        writeJSON(PROFILE_KEY, loadedProfile)
      }
      if (!loadedSession) {
        loadedSession = { persona: 'cliente', email: (legacy as { email?: string }).email ?? loadedProfile.email }
        writeJSON(SESSION_KEY, loadedSession)
      }
      removeKey(LEGACY_KEY)
    }

    if (loadedProfile) setProfile(loadedProfile)
    if (loadedSession) setSession(loadedSession)
    setReady(true)
  }, [])

  const login = useCallback((email: string, password: string, persona: Persona = 'cliente'): boolean => {
    if (!email || !password) return false
    const s = { persona, email }
    setSession(s)
    writeJSON(SESSION_KEY, s)
    return true
  }, [])

  const logout = useCallback(() => {
    setSession(null)
    removeKey(SESSION_KEY) // o perfil de demo é preservado
  }, [])

  const saveProfile = useCallback((next: DemoProfile) => {
    setProfile(next)
    writeJSON(PROFILE_KEY, next)
  }, [])

  const updateUser = useCallback((data: Partial<DemoProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...data }
      writeJSON(PROFILE_KEY, next)
      return next
    })
  }, [])

  const resetProfile = useCallback(() => {
    const def = cloneDefaultProfile()
    setProfile(def)
    removeKey(PROFILE_KEY)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user: session ? profile : null,
        profile,
        persona: session?.persona ?? 'cliente',
        sessionEmail: session?.email ?? null,
        ready,
        login,
        logout,
        updateUser,
        saveProfile,
        resetProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
