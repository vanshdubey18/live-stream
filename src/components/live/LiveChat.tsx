'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, X, MessageCircle, Pin, PinOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ReactionBar from './ReactionBar'

interface ChatMessage {
  id: string
  user_id: string
  user_name: string
  body: string
  created_at: string
  is_pinned?: boolean
}

interface Props {
  sessionId: string
  userId: string
  /** Gym owner viewing their own stream — gets a delete + pin button on every message. */
  canModerate?: boolean
  /** flex-1 fills the parent's remaining height (used in the watch-page rail). */
  fill?: boolean
  /** Replay view — historical log only, no input box and no Realtime subscription. */
  readOnly?: boolean
  /** The gym owner's user id — messages from this id get a coach badge. */
  ownerUserId?: string
  /** Shown next to the header, mirrors Twitch/YouTube's prominent live viewer count. */
  viewerCount?: number
  /** How close to the bottom (px) counts as "at the live edge" for auto-scroll. */
}

const MAX_LEN = 300
const GROUP_WINDOW_MS = 60_000
const NEAR_BOTTOM_PX = 80

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export default function LiveChat({ sessionId, userId, canModerate = false, fill = false, readOnly = false, ownerUserId, viewerCount }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const atBottomRef = useRef(true)

  const scrollToBottom = useCallback(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  function handleScroll() {
    const el = listRef.current
    if (!el) return
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX
  }

  // Initial history load
  useEffect(() => {
    let cancelled = false
    fetch(`/api/live-chat?session_id=${sessionId}`)
      .then(r => r.json())
      .then(d => { if (!cancelled && d.messages) { setMessages(d.messages); requestAnimationFrame(scrollToBottom) } })
      .catch(() => {})
    return () => { cancelled = true }
  }, [sessionId, scrollToBottom])

  // Realtime — new messages push in instantly, deletions/pins update instantly.
  // Skipped in readOnly (replay) mode — the class is over, nothing new to push.
  useEffect(() => {
    if (readOnly) return
    const supabase = createClient()
    const channel = supabase.channel(`live-chat-${sessionId}`)
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'live_chat_messages', filter: `session_id=eq.${sessionId}` },
      (payload) => {
        const m = payload.new as ChatMessage
        setMessages(p => p.some(x => x.id === m.id) ? p : [...p, m])
        // Chat auto-scrolls only while the viewer is already at the live edge —
        // scrolling up to read history shouldn't get yanked back down.
        if (atBottomRef.current) requestAnimationFrame(scrollToBottom)
      }
    )
    channel.on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'live_chat_messages', filter: `session_id=eq.${sessionId}` },
      (payload) => {
        const id = (payload.old as { id: string }).id
        setMessages(p => p.filter(m => m.id !== id))
      }
    )
    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'live_chat_messages', filter: `session_id=eq.${sessionId}` },
      (payload) => {
        const m = payload.new as ChatMessage
        setMessages(p => p.map(x => x.id === m.id ? { ...x, is_pinned: m.is_pinned } : x))
      }
    )
    channel.subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [sessionId, scrollToBottom, readOnly])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const body = input.trim()
    if (!body || sending) return
    setSending(true)
    setInput('')
    try {
      await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, body }),
      })
    } catch { /* Realtime will just not deliver it — input already cleared, low stakes to retry silently */ } finally {
      setSending(false)
    }
  }

  async function handleDelete(id: string) {
    setMessages(p => p.filter(m => m.id !== id))
    await fetch(`/api/live-chat/${id}`, { method: 'DELETE' }).catch(() => {})
  }

  async function handlePin(id: string, pin: boolean) {
    setMessages(p => p.map(m => ({ ...m, is_pinned: m.id === id ? pin : (pin ? false : m.is_pinned) })))
    await fetch(`/api/live-chat/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinned: pin }),
    }).catch(() => {})
  }

  const pinned = messages.find(m => m.is_pinned)

  return (
    <div className={`bg-[#1c1c16] border border-[#322f26] rounded-sm flex flex-col ${fill ? 'h-[50vh] lg:h-auto lg:flex-1 lg:min-h-0' : ''}`}>
      <div className="px-5 py-3 border-b border-[#2a2a20] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MessageCircle size={13} className="text-[#7a7568]" />
          <span className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">{readOnly ? 'Class Chat' : 'Live Chat'}</span>
        </div>
        {typeof viewerCount === 'number' && (
          <span className="font-mincho text-[11px] text-[#b3402f] tracking-[1px] tabular-nums">
            {viewerCount} watching
          </span>
        )}
      </div>

      {pinned && (
        <div className="px-4 py-2.5 border-b border-[#2a2a20] bg-[#b3402f]/[0.06] border-l-2 border-l-[#b3402f] flex items-start gap-2 shrink-0">
          <Pin size={11} className="text-[#b3402f] shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="font-mincho text-[10px] text-[#b3402f] tracking-[2px] uppercase">{pinned.user_name}</p>
            <p className="font-mincho text-sm text-[#f0eadc] leading-snug break-words">{pinned.body}</p>
          </div>
          {canModerate && (
            <button onClick={() => handlePin(pinned.id, false)} className="shrink-0 text-[#7a7568] hover:text-[#f0eadc] transition-colors">
              <PinOff size={12} />
            </button>
          )}
        </div>
      )}

      <div ref={listRef} onScroll={handleScroll} className={`overflow-y-auto px-4 py-3 space-y-2.5 ${fill ? 'flex-1 min-h-0' : 'max-h-96'}`}>
        {messages.length === 0 ? (
          <p className="font-mincho text-[#7a7568] text-xs text-center py-6">
            {readOnly ? 'No messages were sent during this class.' : 'No messages yet — say hi.'}
          </p>
        ) : (
          messages.map((m, i) => {
            const prev = messages[i - 1]
            const grouped = prev && prev.user_id === m.user_id &&
              new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() < GROUP_WINDOW_MS
            const isCoach = ownerUserId && m.user_id === ownerUserId

            return (
              <div key={m.id} className={`group flex items-start gap-2 ${grouped ? '-mt-1.5' : ''}`}>
                <div className="min-w-0 flex-1">
                  {!grouped && (
                    <p className="font-mincho text-[11px] leading-none flex items-center gap-1.5">
                      {isCoach && (
                        <span className="font-mincho text-[8px] text-[#141410] bg-[#b3402f] tracking-[1px] uppercase px-1 py-[1px] rounded-sm">Coach</span>
                      )}
                      <span className={isCoach ? 'text-[#b3402f] font-semibold' : m.user_id === userId ? 'text-[#f0eadc]' : 'text-[#a29c8c]'}>{m.user_name}</span>
                      <span className="text-[#635f54]">{formatTime(m.created_at)}</span>
                    </p>
                  )}
                  <p className={`font-mincho text-sm text-[#f0eadc] leading-snug break-words ${grouped ? '' : 'mt-1'}`}>{m.body}</p>
                </div>
                {canModerate && (
                  <div className="opacity-0 group-hover:opacity-100 shrink-0 flex items-center gap-1.5 transition-opacity">
                    {!m.is_pinned && (
                      <button onClick={() => handlePin(m.id, true)} className="text-[#7a7568] hover:text-[#b3402f]" title="Pin message">
                        <Pin size={12} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(m.id)} className="text-[#7a7568] hover:text-[#b3402f]" title="Delete message">
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {!readOnly && (
        <>
          <ReactionBar sessionId={sessionId} />
          <form onSubmit={handleSend} className="p-3 pt-2 border-t border-[#2a2a20] flex items-center gap-2 shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              maxLength={MAX_LEN}
              placeholder="Send a message…"
              className="flex-1 min-w-0 bg-[#141410] border border-[#322f26] rounded-sm px-3 py-2 font-mincho text-sm text-[#f0eadc] placeholder-[#635f54] focus:outline-none focus:border-[#7a7568] transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="w-9 h-9 shrink-0 bg-[#b3402f]/10 border border-[#b3402f]/20 rounded-sm flex items-center justify-center text-[#b3402f] hover:bg-[#b3402f]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        </>
      )}
    </div>
  )
}
