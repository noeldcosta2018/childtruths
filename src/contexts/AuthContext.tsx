'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if we're returning from OAuth (tokens in URL hash)
    const hashHasTokens = typeof window !== 'undefined' &&
      window.location.hash.includes('access_token')

    // Listen for auth state changes (fires when hash tokens are detected)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('[Auth]', event, currentSession ? 'session exists' : 'no session')
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        setLoading(false)

        // Clean up URL hash after sign in
        if (event === 'SIGNED_IN' && typeof window !== 'undefined' && window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname)
        }
      }
    )

    // Only call getSession if NOT returning from OAuth
    // If returning from OAuth, let onAuthStateChange handle it to avoid race condition
    if (!hashHasTokens) {
      supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
        setSession(existingSession)
        setUser(existingSession?.user ?? null)
        setLoading(false)
      })
    }

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
