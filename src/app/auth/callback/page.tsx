'use client'

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error) {
          console.error('Auth callback error:', error.message)
        } else {
          console.log('Auth success, session established')
        }
        // Small delay to let AuthContext pick up the session
        setTimeout(() => {
          window.location.replace('/')
        }, 500)
      })
    } else {
      // Maybe tokens are in the hash (implicit flow fallback)
      // Let Supabase auto-detect from URL hash
      supabase.auth.getSession().then(() => {
        window.location.replace('/')
      })
    }
  }, [])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#fff',
      fontFamily: 'Plus Jakarta Sans, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid #333',
          borderTopColor: '#2dd4a8',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p>Signing you in...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
