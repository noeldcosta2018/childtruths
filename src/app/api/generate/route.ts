import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase-server'

async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
  return user
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { question, childName, age, country, belief, trigger, triggerDetail, language } = body

    if (!question || !childName || !age) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Usage check
    const month = new Date().toISOString().slice(0, 7)
    const { data: usageData } = await supabaseAdmin
      .from('usage_tracking')
      .select('count')
      .eq('user_id', user.id)
      .eq('month', month)
      .single()

    const currentUsage = usageData?.count || 0

    // Check subscription
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .single()

    const isPro = !!subscription
    const MAX_FREE = 3

    if (currentUsage >= MAX_FREE && !isPro) {
      return NextResponse.json({ error: 'Free limit reached. Please upgrade.' }, { status: 402 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json(fallback(childName, age, belief))

    const sys = `You are ChildTruths. Generate 4 LAYERED explanations (simplest→most detailed) for a parent to tell their child.
Context: Child=${childName}, Age=${age}, Country=${country||'General'}, Beliefs=${belief||'General'}, Language=${language||'English'}, Trigger=${trigger||'none'}, Detail=${triggerDetail||'none'}.

RULES:
1. Layer 1: warmest, simplest, 2 sentences max. Use child's name.
2. Layer 2: gentle detail, still no biology.
3. Layer 3: basic biology/concepts with proper terms.
4. Layer 4: full age-appropriate truth.
5. Frame in family belief system naturally.
6. Consider cultural context of ${country || 'General'}.
7. Each layer includes what the child might ask next.
${language && language !== 'English' ? `8. Respond entirely in ${language}.` : ''}

Respond ONLY valid JSON: {"layers":[{"level":1,"title":"Start here","subtitle":"...","quote":"...","note":"...","nextQ":"If they ask: ..."},{"level":2,"title":"If they push","subtitle":"...","quote":"...","note":"...","nextQ":"..."},{"level":3,"title":"If they really want to know","subtitle":"...","quote":"...","note":"...","nextQ":"..."},{"level":4,"title":"The full truth","subtitle":"...","quote":"...","note":"..."}],"parentTip":"...","misinfoTip":"..."}`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: sys,
        messages: [{ role: 'user', content: `Child asked: "${question}". Generate layered explanation.` }],
      }),
    })

    if (!res.ok) return NextResponse.json(fallback(childName, age, belief))

    const data = await res.json()
    const text = data.content.map((c: any) => c.text || '').join('')
    const clean = text.replace(/```json|```/g, '').trim()

    let result
    try {
      result = JSON.parse(clean)
    } catch {
      return NextResponse.json(fallback(childName, age, belief))
    }

    // Increment usage
    if (currentUsage === 0) {
      await supabaseAdmin
        .from('usage_tracking')
        .insert({ user_id: user.id, month, count: 1 })
    } else {
      await supabaseAdmin
        .from('usage_tracking')
        .update({ count: currentUsage + 1 })
        .eq('user_id', user.id)
        .eq('month', month)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json({ error: 'Failed to generate' }, { status: 500 })
  }
}

function fallback(name: string, age: string, belief: string) {
  const b = belief === 'Islam' ? 'Allah blessed us' : belief === 'Christianity' ? 'God blessed us' : 'we were blessed'
  const d = belief === 'Islam' ? ", by Allah's will" : belief === 'Christianity' ? ", by God's design" : ''
  return {
    layers: [
      { level: 1, title: "Start here", subtitle: "The simple, warm answer",
        quote: `${name}, I'm glad you asked me. Mommy and Daddy loved each other very much, and ${b} with a baby that grew inside Mommy's tummy. That baby was you.`,
        note: "True, warm, age-appropriate. Most children are satisfied here.",
        nextQ: `If ${name} asks: "But how did the baby get there?" → Open Layer 2` },
      { level: 2, title: "If they push", subtitle: "A little more, still gentle",
        quote: `When a mommy and daddy love each other and are married, something special happens${d} that starts a baby growing inside the mommy. It's one of the most amazing things our bodies can do.`,
        note: "Adds that bodies are involved without specifics. Most kids stop here.",
        nextQ: `If ${name} asks: "But what special thing?" → Open Layer 3` },
      { level: 3, title: "If they really want to know", subtitle: "Simple biology",
        quote: `Inside every mommy, there's a tiny egg — way smaller than a grain of sand. And daddies have something that helps that egg start growing into a baby. When they come together inside the mommy's body, a new baby begins to grow in the uterus. It takes about nine months.`,
        note: "Introduces real biology. Uses proper terms.",
        nextQ: `If ${name} asks: "How do they come together?" → Open Layer 4` },
      { level: 4, title: "The full truth", subtitle: "Age-appropriate biology",
        quote: `When a husband and wife are married, part of their private relationship involves their bodies getting very close. The father's body sends tiny things called sperm to meet the egg inside the mother. When one meets the egg, it begins to grow into a baby${d}. This is only for married adults.`,
        note: "Factual. Framed within family values." },
    ],
    parentTip: `Ask ${name}: "What exactly did you see or hear?" Their answer tells you how much they already know. Read Layer 1 and wait.`,
    misinfoTip: `If ${name} heard something wrong from friends, say: "I'm glad you asked me. Let me tell you what's actually true."`,
  }
}
