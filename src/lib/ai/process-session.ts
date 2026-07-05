import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

interface ExtractedTechnique {
  name: string
  timestamp: string | null
}

interface KeyMoment {
  timestamp: string
  label: string
}

export interface AIKeyMoments {
  techniques: ExtractedTechnique[]
  moments: KeyMoment[]
  coachQuote: string
}

// Cloudflare Stream doesn't expose a direct fetchable audio/video file by
// default — an MP4 download has to be explicitly enabled per-video, then
// polled until Cloudflare finishes encoding it. Enabling is idempotent.
async function ensureMp4Url(cfVideoUid: string): Promise<string | null> {
  const base = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/${cfVideoUid}/downloads`
  const headers = {
    Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json',
  }

  await fetch(base, { method: 'POST', headers }).catch(() => null)

  // Poll for encoding to finish — usually under a minute, cap at ~4 minutes.
  for (let i = 0; i < 16; i++) {
    const res = await fetch(base, { headers })
    if (res.ok) {
      const { result } = await res.json()
      if (result?.default?.status === 'ready' && result.default.url) {
        return result.default.url as string
      }
    }
    await new Promise(resolve => setTimeout(resolve, 15_000))
  }
  return null
}

async function transcribeWithDeepgram(mp4Url: string): Promise<string> {
  const { DeepgramClient } = await import('@deepgram/sdk')
  const deepgram = new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY! })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await deepgram.listen.v1.media.transcribeUrl({ url: mp4Url, model: 'nova-3' as any, smart_format: true, punctuate: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (response as any)?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? ''
}

async function extractWithClaude(
  transcript: string,
  meta: { title: string; discipline: string; coach: string | null }
): Promise<AIKeyMoments> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const { content } = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1200,
    messages: [{
      role: 'user',
      content: `Analyze this ${meta.discipline} class transcript. Class: "${meta.title}". Coach: ${meta.coach ?? 'Unknown'}.

Transcript:
${transcript.slice(0, 12000)}

Return ONLY valid JSON (no markdown fences):
{
  "techniques": [{ "name": "technique name", "timestamp": "MM:SS or null" }],
  "moments": [{ "timestamp": "MM:SS", "label": "brief description of what happens" }],
  "coachQuote": "one memorable quote or key teaching point"
}

Rules:
- techniques: all distinct techniques and positions taught, max 10, include first-mention timestamp if said aloud
- moments: 3-5 most important teaching moments with timestamps
- coachQuote: exact words from the coach if possible; otherwise the single clearest teaching point
- NEVER invent content not in the transcript`,
    }],
  })

  const raw = content[0].type === 'text' ? content[0].text : ''
  const clean = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
  return JSON.parse(clean) as AIKeyMoments
}

export async function processSession(sessionId: string): Promise<void> {
  if (!process.env.DEEPGRAM_API_KEY || !process.env.ANTHROPIC_API_KEY) {
    console.warn('[process-session] Missing DEEPGRAM_API_KEY or ANTHROPIC_API_KEY — skipping')
    return
  }

  const admin = getAdmin()

  const { data: session } = await admin
    .from('sessions')
    .select('id, title, discipline, cf_video_uid, ai_summary, coaches(name)')
    .eq('id', sessionId)
    .maybeSingle()

  if (!session) return
  if (session.ai_summary) return  // already processed
  if (!session.cf_video_uid) {
    console.warn(`[process-session] No cf_video_uid for ${sessionId}`)
    return
  }

  console.log(`[process-session] Starting for session ${sessionId}`)

  try {
    const mp4Url = await ensureMp4Url(session.cf_video_uid)
    if (!mp4Url) {
      console.warn(`[process-session] MP4 download never became ready for ${sessionId}`)
      return
    }

    const transcript = await transcribeWithDeepgram(mp4Url)
    if (!transcript) {
      console.warn(`[process-session] Empty transcript for ${sessionId}`)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coachName = (session.coaches as any)?.name ?? null
    const extraction = await extractWithClaude(transcript, {
      title: session.title,
      discipline: session.discipline,
      coach: coachName,
    })

    // Derive a plain summary sentence for the ai_summary text column
    // (Claude already gave us techniques + moments; use first sentence of coachQuote as the hook)
    const techniqueNames = extraction.techniques.map(t => t.name).join(', ')
    const aiSummary = `This ${session.discipline} class covered: ${techniqueNames || 'fundamental techniques'}. ${extraction.coachQuote ? `Coach's key point: "${extraction.coachQuote}"` : ''}`

    await admin.from('sessions').update({
      transcript,
      ai_summary: aiSummary,
      ai_techniques: extraction.techniques.map(t => t.name),
      ai_key_moments: extraction,
    }).eq('id', sessionId)

    // Upsert to global technique knowledge graph
    for (const t of extraction.techniques) {
      const slug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

      const { data: existing } = await admin
        .from('techniques')
        .select('id, session_count')
        .eq('name', t.name)
        .maybeSingle()

      let techniqueId: string
      if (existing) {
        await admin.from('techniques')
          .update({ session_count: existing.session_count + 1 })
          .eq('id', existing.id)
        techniqueId = existing.id
      } else {
        const { data: inserted } = await admin.from('techniques')
          .insert({
            name: t.name,
            discipline: session.discipline,
            canonical_slug: slug,
            session_count: 1,
          })
          .select('id')
          .single()
        if (!inserted) continue
        techniqueId = inserted.id
      }

      const timestampSeconds = t.timestamp
        ? (() => {
            const [m, s] = t.timestamp.split(':').map(Number)
            return m * 60 + (s || 0)
          })()
        : null

      await admin.from('session_techniques').upsert(
        { session_id: sessionId, technique_id: techniqueId, timestamp_seconds: timestampSeconds },
        { onConflict: 'session_id,technique_id', ignoreDuplicates: true }
      )
    }

    console.log(`[process-session] Done for ${sessionId}: ${extraction.techniques.length} techniques, ${extraction.moments.length} moments`)
  } catch (err) {
    console.error(`[process-session] Error for ${sessionId}:`, err)
  }
}
