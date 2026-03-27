import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  return NextResponse.json({
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
    error: error?.message,
    cookieNames: allCookies.map(c => c.name),
    envCheck: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKeyStart: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20),
      anonKeyEnd: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(-10),
      anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
      serviceKeyStart: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20),
      serviceKeyEnd: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(-10),
    }
  })
}
