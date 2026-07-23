import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI Coach not configured' }, { status: 503 })
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Every call bills the Anthropic API — cap per-user usage so this can't
  // become an uncapped-spend vector.
  const allowed = await checkRateLimit(`coach-chat:${user.id}`, 10, 60)
  if (!allowed) return NextResponse.json({ error: 'Too many questions — try again in a minute.' }, { status: 429 })

  const { question, gymId } = await req.json()
  if (!question?.trim()) return NextResponse.json({ error: 'Question required' }, { status: 400 })
  if (question.length > 500) return NextResponse.json({ error: 'Question too long' }, { status: 400 })

  const admin = getAdmin()

  // Previously any logged-in user could pass any gymId (or omit it entirely
  // and get every gym's transcripts) — restrict to gyms this user actually
  // has access to: gyms they actively belong to, or the gym they own.
  const [{ data: memberships }, { data: ownedGym }] = await Promise.all([
    admin.from('memberships').select('gym_id').eq('user_id', user.id).eq('status', 'active'),
    admin.from('gyms').select('id').eq('owner_id', user.id).maybeSingle(),
  ])
  const allowedGymIds = [
    ...(memberships ?? []).map(m => m.gym_id),
    ...(ownedGym ? [ownedGym.id] : []),
  ]

  if (allowedGymIds.length === 0) {
    return NextResponse.json({
      answer: "I don't have any class transcripts yet. Once your gym streams a session and the replay is ready, I'll be able to answer questions about what was taught.",
      citations: [],
    })
  }

  const targetGymIds = gymId && allowedGymIds.includes(gymId) ? [gymId] : allowedGymIds

  const { data: sessions } = await admin
    .from('sessions')
    .select('id, title, discipline, transcript, ai_summary, ai_key_moments, scheduled_at, coaches(name)')
    .eq('status', 'ended')
    .not('transcript', 'is', null)
    .in('gym_id', targetGymIds)
    .order('scheduled_at', { ascending: false })
    .limit(5)

  if (!sessions?.length) {
    return NextResponse.json({
      answer: "I don't have any class transcripts yet. Once your gym streams a session and the replay is ready, I'll be able to answer questions about what was taught.",
      citations: [],
    })
  }

  // Build RAG context from available transcripts
  const contextBlocks = sessions.map(s => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coachName = (s.coaches as any)?.name ?? 'Coach'
    const date = new Date(s.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    // Use summary as a compact proxy if full transcript is very long
    const content = s.transcript
      ? s.transcript.slice(0, 3000)
      : s.ai_summary ?? ''
    return `--- Class: "${s.title}" (${s.discipline}) | Coach: ${coachName} | Date: ${date} ---\n${content}`
  }).join('\n\n')

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const systemPrompt = `You are the AI Coach for a combat sports gym. You answer questions based ONLY on the class transcripts provided below.

Rules:
1. Answer ONLY from the transcripts. Never invent techniques, timestamps, or quotes.
2. If the answer isn't in the transcripts, say exactly: "I didn't find that covered in your recent classes — ask your coach directly."
3. When you cite something, mention the class name and date.
4. Be concise (2-4 sentences). Speak like a knowledgeable training partner, not a textbook.
5. If the user asks about a specific technique, find where it was mentioned and quote the context.

Available class transcripts:
${contextBlocks}`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    system: systemPrompt,
    messages: [{ role: 'user', content: question.trim() }],
  })

  const answer = message.content[0].type === 'text' ? message.content[0].text : ''

  return NextResponse.json({ answer, citations: sessions.map(s => s.title) })
}
