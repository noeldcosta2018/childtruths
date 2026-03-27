import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { plan, email } = await request.json()
    
    // Demo mode — returns success URL
    // Replace with real Stripe integration when ready
    return NextResponse.json({ 
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://childtruths.vercel.app'}?checkout=success`, 
      demo: true 
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
