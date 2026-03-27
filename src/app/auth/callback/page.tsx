'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  useEffect(() => {
    // Supabase client-side will automatically detect the code in the URL
    // and exchange it for a session using the PKCE code verifier from localStorage
    const handleCallback = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      )

      if (error) {
        console.error('Auth callback error:', error)
      }

      // Redirect to home - the AuthContext will pick up the session
      window.location.href = '/'
    }

    // Check if there's a code in the URL
    const params = new URLSearchParams(window.location.search)
    if (params.get('code')) {
      handleCallback()
    } else {
      // No code, just redirect home
      window.location.href = '/'
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
