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
    const MAX_FREE = 7

    if (currentUsage >= MAX_FREE && !isPro) {
      return NextResponse.json({ error: 'Free limit reached. Please upgrade.' }, { status: 402 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json(fallback(childName, age, belief))

    const sys = `You are ChildTruths — an expert in child psychology, cultural sensitivity, and age-appropriate communication. Generate 4 LAYERED explanations (simplest→most detailed) for a parent to read aloud to their child.

Context: Child=${childName}, Age=${age}, Country=${country||'General'}, Family beliefs=${belief||'General'}, Language=${language||'English'}, Trigger=${trigger||'none'}, Detail=${triggerDetail||'none'}.

CRITICAL RULES:
1. Layer 1 ("Start here"): The warmest, simplest answer. 2 sentences max. Use the child's name. This should satisfy most children. Written as if a loving parent is speaking.
2. Layer 2 ("If they push"): A little more detail, still warm. Mentions that bodies are involved but NO anatomy terms, NO clinical language. Keep it gentle and age-appropriate.
3. Layer 3 ("If they really want to know"): More detail but use SOFT, non-clinical language. Say "a special place inside the mommy's body" NOT "uterus/vagina/lining". Avoid any words that would make a parent in ${country || 'a conservative culture'} uncomfortable reading aloud. Keep it factual but gentle.
4. Layer 4 ("The full truth"): Age-appropriate biology using proper but respectful terms. For ages 3-8, still keep language soft. For ages 9-14, you may introduce proper terms (like "uterus", "sperm", "egg") but frame them within the family's belief system and cultural norms. Never be graphic or uncomfortable.

TONE & CULTURAL SENSITIVITY:
- Frame naturally within the family's ${belief || 'general'} belief system — weave it in, don't force it.
- Respect the cultural norms of ${country || 'the family'}. Parents in the Middle East, South Asia, or conservative communities should feel comfortable reading every layer aloud.
- The parent should NEVER feel embarrassed reading any layer to their child.
- Always truthful — never lie or mislead. But truth can be delivered gently.
- Each layer's "note" should reassure the parent (e.g., "Most kids stop here").
- Each layer's "nextQ" predicts what the child might ask next.
${language && language !== 'English' ? `- Respond ENTIRELY in ${language}. All quotes, notes, tips — everything in ${language}.` : ''}

Respond ONLY valid JSON (no markdown, no backticks): {"layers":[{"level":1,"title":"Start here","subtitle":"The simple, warm answer","quote":"...","note":"...","nextQ":"If ${childName} asks: \\"...\\" → Open Layer 2"},{"level":2,"title":"If they push","subtitle":"A little more, still gentle","quote":"...","note":"...","nextQ":"If ${childName} asks: \\"...\\" → Open Layer 3"},{"level":3,"title":"If they really want to know","subtitle":"More detail, still comfortable","quote":"...","note":"...","nextQ":"If ${childName} asks: \\"...\\" → Open Layer 4"},{"level":4,"title":"The full truth","subtitle":"Age-appropriate biology","quote":"...","note":"..."}],"parentTip":"...","misinfoTip":"..."}`

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
      { level: 3, title: "If they really want to know", subtitle: "More detail, still comfortable",
        quote: `Inside every mommy, there's a tiny egg — way smaller than a grain of sand. And daddies have something special that helps that egg start growing into a baby. When they come together in a special place inside the mommy's body${d}, a new baby begins to grow. It takes about nine months!`,
        note: "More detail but still comfortable to read aloud. No clinical terms.",
        nextQ: `If ${name} asks: "How do they come together?" → Open Layer 4` },
      { level: 4, title: "The full truth", subtitle: "Age-appropriate biology",
        quote: `When a husband and wife are married, part of their private relationship involves their bodies getting very close${d}. The father's body has tiny cells called sperm, and the mother's body has a tiny egg. When they meet inside the mother's body, a baby begins to grow in a safe, warm place called the womb. This is something only for married adults, and it's one of the most beautiful parts of how families are made.`,
        note: "Factual and respectful. Framed within family values." },
    ],
    parentTip: `Ask ${name}: "What exactly did you see or hear?" Their answer tells you how much they already know. Read Layer 1 and wait.`,
    misinfoTip: `If ${name} heard something wrong from friends, say: "I'm glad you asked me. Let me tell you what's actually true."`,
  }
}
