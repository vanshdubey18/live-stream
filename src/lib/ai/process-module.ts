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

interface AIKeyMoments {
  techniques: ExtractedTechnique[]
  moments: KeyMoment[]
  coachQuote: string
}

// Same Cloudflare MP4-download dance as process-session.ts — Stream doesn't
// expose a fetchable file until explicitly enabled + encoded.
async function ensureMp4Url(cfVideoUid: string): Promise<string | null> {
  const base = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/${cfVideoUid}/downloads`
  const headers = {
    Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json',
  }

  await fetch(base, { method: 'POST', headers }).catch(() => null)

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
      content: `Analyze this ${meta.discipline} instructional video transcript. Title: "${meta.title}". Coach: ${meta.coach ?? 'Unknown'}.

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

// Same transcribe + extract pipeline as process-session.ts, targeted at
// `modules` instead of `sessions`. Deliberately doesn't touch the shared
// `techniques`/`session_techniques` knowledge graph (that FK is
// session-scoped) — a module's ai_techniques/ai_summary live only on its
// own row for now.
export async function processModule(moduleId: string): Promise<void> {
  if (!process.env.DEEPGRAM_API_KEY || !process.env.ANTHROPIC_API_KEY) {
    console.warn('[process-module] Missing DEEPGRAM_API_KEY or ANTHROPIC_API_KEY — skipping')
    return
  }

  const admin = getAdmin()

  const { data: module } = await admin
    .from('modules')
    .select('id, title, discipline, cf_video_uid, ai_summary, coaches(name)')
    .eq('id', moduleId)
    .maybeSingle()

  if (!module) return
  if (module.ai_summary) return // already processed
  if (!module.cf_video_uid) {
    console.warn(`[process-module] No cf_video_uid for ${moduleId}`)
    return
  }

  console.log(`[process-module] Starting for module ${moduleId}`)

  try {
    const mp4Url = await ensureMp4Url(module.cf_video_uid)
    if (!mp4Url) {
      console.warn(`[process-module] MP4 download never became ready for ${moduleId}`)
      return
    }

    const transcript = await transcribeWithDeepgram(mp4Url)
    if (!transcript) {
      console.warn(`[process-module] Empty transcript for ${moduleId}`)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coachName = (module.coaches as any)?.name ?? null
    const extraction = await extractWithClaude(transcript, {
      title: module.title,
      discipline: module.discipline,
      coach: coachName,
    })

    const techniqueNames = extraction.techniques.map(t => t.name).join(', ')
    const aiSummary = `This ${module.discipline} instructional covers: ${techniqueNames || 'fundamental techniques'}. ${extraction.coachQuote ? `Coach's key point: "${extraction.coachQuote}"` : ''}`

    await admin.from('modules').update({
      transcript,
      ai_summary: aiSummary,
      ai_techniques: extraction.techniques.map(t => t.name),
      ai_key_moments: extraction,
    }).eq('id', moduleId)

    console.log(`[process-module] Done for ${moduleId}: ${extraction.techniques.length} techniques, ${extraction.moments.length} moments`)
  } catch (err) {
    console.error(`[process-module] Error for ${moduleId}:`, err)
  }
}
