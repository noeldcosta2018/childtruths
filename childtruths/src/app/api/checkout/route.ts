import { NextRequest, NextResponse } from 'next/server'
export async function POST(request: NextRequest) {
  try {
    const { plan, email } = await request.json()
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_APP_URL||'http://localhost:3000'}?checkout=success`, demo: true })
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey)
    const priceId = plan==='annual' ? process.env.STRIPE_ANNUAL_PRICE_ID : process.env.STRIPE_MONTHLY_PRICE_ID
    if (!priceId) return NextResponse.json({ error: 'Price IDs not configured' }, { status: 500 })
    const session = await stripe.checkout.sessions.create({
      mode:'subscription', payment_method_types:['card'], customer_email:email,
      line_items:[{price:priceId,quantity:1}],
      success_url:`${process.env.NEXT_PUBLIC_APP_URL}?checkout=success`,
      cancel_url:`${process.env.NEXT_PUBLIC_APP_URL}?checkout=cancel`,
    })
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
