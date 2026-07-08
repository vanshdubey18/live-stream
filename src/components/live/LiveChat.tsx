'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, X, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ChatMessage {
  id: string
  user_id: string
  user_name: string
  body: string
  created_at: string
}

interface Props {
  sessionId: string
  userId: string
  /** Gym owner viewing their own stream — gets a delete button on every message. */
  canModerate?: boolean
  /** flex-1 fills the parent's remaining height (used in the watch-page rail). */
  fill?: boolean
}

const MAX_LEN = 300

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export default function LiveChat({ sessionId, userId, canModerate = false, fill = false }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  // Initial history load
  useEffect(() => {
    let cancelled = false
    fetch(`/api/live-chat?session_id=${sessionId}`)
      .then(r => r.json())
      .then(d => { if (!cancelled && d.messages) { setMessages(d.messages); requestAnimationFrame(scrollToBottom) } })
      .catch(() => {})
    return () => { cancelled = true }
  }, [sessionId, scrollToBottom])

  // Realtime — new messages push in instantly, deletions remove instantly
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(`live-chat-${sessionId}`)
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'live_chat_messages', filter: `session_id=eq.${sessionId}` },
      (payload) => {
        const m = payload.new as ChatMessage
        setMessages(p => p.some(x => x.id === m.id) ? p : [...p, m])
        requestAnimationFrame(scrollToBottom)
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
    channel.subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [sessionId, scrollToBottom])

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

  return (
    <div className={`bg-[#1c1c16] border border-[#322f26] rounded-sm flex flex-col ${fill ? 'h-[50vh] lg:h-auto lg:flex-1 lg:min-h-0' : ''}`}>
      <div className="px-5 py-3 border-b border-[#2a2a20] flex items-center gap-2 shrink-0">
        <MessageCircle size={13} className="text-[#7a7568]" />
        <span className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Live Chat</span>
      </div>

      <div ref={listRef} className={`overflow-y-auto px-4 py-3 space-y-2.5 ${fill ? 'flex-1 min-h-0' : 'max-h-96'}`}>
        {messages.length === 0 ? (
          <p className="font-mincho text-[#7a7568] text-xs text-center py-6">No messages yet — say hi.</p>
        ) : (
          messages.map(m => (
            <div key={m.id} className="group flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-mincho text-[11px] leading-none">
                  <span className={m.user_id === userId ? 'text-[#b3402f]' : 'text-[#a29c8c]'}>{m.user_name}</span>
                  <span className="text-[#635f54] ml-2">{formatTime(m.created_at)}</span>
                </p>
                <p className="font-mincho text-sm text-[#f0eadc] leading-snug mt-1 break-words">{m.body}</p>
              </div>
              {canModerate && (
                <button
                  onClick={() => handleDelete(m.id)}
                  className="opacity-0 group-hover:opacity-100 shrink-0 text-[#7a7568] hover:text-[#b3402f] transition-opacity"
                  title="Delete message"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-[#2a2a20] flex items-center gap-2 shrink-0">
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
    </div>
  )
}
