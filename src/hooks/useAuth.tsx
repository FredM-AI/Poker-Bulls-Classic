import * as React from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { UserRole } from '@/lib/types'

const GUEST_STORAGE_KEY = 'pbc_guest_mode'

type AuthContextValue = {
  session: Session | null
  role: UserRole | null
  /** True only for 'admin' or 'floor_manager' — never for 'guest'. Use this to gate any write action. */
  canManage: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  continueAsGuest: () => void
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

function getSessionRole(session: Session | null): 'admin' | 'floor_manager' | null {
  // app_metadata (not user_metadata) because it can only be set by an admin/service_role,
  // never by the signed-in user themselves — user_metadata is client-editable and must
  // never be used for authorization decisions.
  const role = session?.user?.app_metadata?.role
  return role === 'admin' || role === 'floor_manager' ? role : null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null)
  const [isGuest, setIsGuest] = React.useState(() => localStorage.getItem(GUEST_STORAGE_KEY) === '1')
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setIsLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const login = React.useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    localStorage.removeItem(GUEST_STORAGE_KEY)
    setIsGuest(false)
    return {}
  }, [])

  const continueAsGuest = React.useCallback(() => {
    localStorage.setItem(GUEST_STORAGE_KEY, '1')
    setIsGuest(true)
  }, [])

  const logout = React.useCallback(async () => {
    localStorage.removeItem(GUEST_STORAGE_KEY)
    setIsGuest(false)
    await supabase.auth.signOut()
  }, [])

  const sessionRole = getSessionRole(session)
  // A real admin/floor_manager session always takes priority over a leftover guest flag.
  const role: UserRole | null = sessionRole ?? (isGuest ? 'guest' : null)

  const value = React.useMemo<AuthContextValue>(
    () => ({
      session,
      role,
      canManage: role === 'admin' || role === 'floor_manager',
      isLoading,
      login,
      continueAsGuest,
      logout,
    }),
    [session, role, isLoading, login, continueAsGuest, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
