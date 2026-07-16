'use client'

import { createClient } from '@/lib/supabase/client'

const REACTIONS = ['🔥', '👊', '💪', '🥋', '😤']

export default function ReactionBar({ sessionId }: { sessionId: string }) {
  function send(emoji: string) {
    const supabase = createClient()
    const channel = supabase.channel(`live-reactions-${sessionId}`)
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({ type: 'broadcast', event: 'reaction', payload: { emoji } })
        setTimeout(() => supabase.removeChannel(channel), 500)
      }
    })
  }

  return (
    <div className="flex items-center gap-1.5 px-3 pt-2.5">
      {REACTIONS.map(e => (
        <button
          key={e}
          onClick={() => send(e)}
          className="w-8 h-8 flex items-center justify-center text-base rounded-sm border border-[#322f26] hover:border-[#b3402f]/50 hover:bg-[#b3402f]/10 active:scale-90 transition-all"
        >
          {e}
        </button>
      ))}
    </div>
  )
}
