import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getDbRole } from '@/lib/supabase/admin'
import { cfThumbnailUrl } from '@/lib/cf-thumbnail'
import BuyModuleButton from '@/components/member/BuyModuleButton'
import InstructionalClient from './InstructionalClient'

export default async function InstructionalPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirectTo=/instructional/${params.id}`)

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: mod } = await admin
    .from('modules')
    .select('id, title, description, discipline, level, price_paise, status, cf_video_uid, duration_seconds, transcript, ai_summary, ai_techniques, ai_key_moments, gym_id, coaches(name), gyms(name)')
    .eq('id', params.id)
    .in('status', ['processing', 'ready'])
    .maybeSingle()

  if (!mod) redirect('/dashboard/instructionals')

  const role = await getDbRole(user.id)
  let owned = role === 'admin'
  if (!owned) {
    const { data: purchase } = await admin
      .from('module_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('module_id', mod.id)
      .eq('status', 'paid')
      .maybeSingle()
    owned = !!purchase
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coachName = (mod.coaches as any)?.name ?? null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gymName = (mod.gyms as any)?.name ?? null

  if (!owned) {
    const thumb = cfThumbnailUrl(mod.cf_video_uid, 600)
    return (
      <div className="min-h-screen bg-[#141410] flex items-center justify-center px-4">
        <div className="relative bg-[#1c1c16] border border-[#322f26] rounded-sm max-w-lg w-full overflow-hidden">
          {thumb && (
            <div className="relative h-56 bg-[#18180f]">
              <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover grayscale contrast-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c16] via-[#1c1c16]/40 to-transparent" />
            </div>
          )}
          <div className="p-8 text-center space-y-3">
            <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">{mod.discipline}{gymName ? ` · ${gymName}` : ''}</p>
            <h1 className="font-mincho text-3xl text-[#f0eadc] tracking-[1px]">{mod.title}</h1>
            {mod.description && <p className="font-mincho text-sm text-[#a29c8c] leading-relaxed">{mod.description}</p>}
            {coachName && <p className="font-mincho text-xs text-[#7a7568]">Taught by {coachName}</p>}
            <div className="pt-3 flex justify-center">
              <BuyModuleButton moduleId={mod.id} priceLabel={`₹${(mod.price_paise / 100).toLocaleString('en-IN')}`} />
            </div>
            <a href="/dashboard/instructionals" className="inline-block font-mincho text-[#7a7568] hover:text-[#f0eadc] text-xs transition-colors pt-2">
              Back to library
            </a>
          </div>
        </div>
      </div>
    )
  }

  const hlsUrl = mod.cf_video_uid
    ? `https://customer-${process.env.NEXT_PUBLIC_CF_CUSTOMER_SUBDOMAIN}.cloudflarestream.com/${mod.cf_video_uid}/manifest/video.m3u8`
    : undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aiKeyMoments = (mod as any).ai_key_moments as any

  return (
    <InstructionalClient
      title={mod.title}
      discipline={mod.discipline}
      level={mod.level}
      coach={coachName}
      gym={gymName}
      hlsUrl={hlsUrl}
      aiData={mod.ai_summary ? {
        summary: mod.ai_summary,
        techniques: aiKeyMoments?.techniques ?? (mod.ai_techniques ?? []).map((name: string) => ({ name, timestamp: null })),
        moments: aiKeyMoments?.moments ?? [],
        coachQuote: aiKeyMoments?.coachQuote ?? '',
      } : null}
    />
  )
}
