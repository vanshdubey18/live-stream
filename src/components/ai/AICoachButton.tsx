'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'ai'
  text: string
  loading?: boolean
}

const INITIAL: Message[] = [
  { role: 'ai', text: "I analyse every class you attend and answer questions about techniques your coaches taught. Ask me anything about your recent sessions." },
]

const SUGGESTED = [
  'What did my coach teach about half guard?',
  'Summarise my last class',
  'What techniques should I drill this week?',
]

export default function AICoachButton({ gymId }: { gymId?: string }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>(INITIAL)
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('open-ai-coach', handler)
    return () => window.removeEventListener('open-ai-coach', handler)
  }, [])

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function sendQuestion(question: string) {
    if (!question.trim() || loading) return
    setMessages(p => [...p, { role: 'user', text: question.trim() }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), gymId }),
      })
      const data = await res.json()
      setMessages(p => [...p, { role: 'ai', text: data.answer ?? 'Something went wrong. Try again.' }])
    } catch {
      setMessages(p => [...p, { role: 'ai', text: 'Connection error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop — mobile full-screen sheet only */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/80"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Chat panel — full-screen sheet on mobile, side panel on desktop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-x-0 bottom-0 top-14 z-50 lg:inset-auto lg:top-1/2 lg:-translate-y-1/2 lg:right-14 lg:bottom-auto lg:w-[380px] bg-[#1c1c16] border-t lg:border border-[#322f26] rounded-t-sm lg:rounded-sm shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 56px)' }}
          >
            {/* Header — coach avatar + greeting, Whoop-Coach style */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#2a2a20] bg-[#141410] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-sm bg-[#b3402f]/10 border border-[#b3402f]/20 flex items-center justify-center shrink-0">
                  <Sparkles size={18} className="text-[#b3402f]" />
                </div>
                <div className="min-w-0">
                  <p className="font-mincho text-lg text-[#f0eadc] tracking-[1px] leading-none">Matpeak Coach</p>
                  <p className="font-mincho text-[11px] text-[#7a7568] mt-1 truncate">Knows every class you&apos;ve trained</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-[#7a7568] hover:text-[#f0eadc] transition-colors shrink-0">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 min-h-[200px]">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] px-4 py-3 rounded-sm font-mincho text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#b3402f]/10 border border-[#b3402f]/20 text-[#f0eadc]'
                      : 'bg-[#141410] border border-[#2a2a20] text-[#c9bda0]'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-[#141410] border border-[#2a2a20] px-4 py-3 rounded-sm flex items-center gap-2.5">
                    <Loader2 size={13} className="text-[#b3402f] animate-spin" />
                    <span className="font-mincho text-xs text-[#7a7568]">Searching your classes…</span>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && !loading && (
              <div className="px-5 pb-4 flex flex-col gap-2 shrink-0">
                {SUGGESTED.map(s => (
                  <button
                    key={s}
                    onClick={() => sendQuestion(s)}
                    className="text-left px-3.5 py-2.5 border border-[#322f26] rounded-sm font-mincho text-xs text-[#a29c8c] hover:border-[#7a7568] hover:text-[#f0eadc] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-5 py-4 border-t border-[#2a2a20] shrink-0">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendQuestion(input)}
                  placeholder="Ask your coach anything…"
                  disabled={loading}
                  className="flex-1 bg-[#141410] border border-[#322f26] rounded-sm px-3.5 py-2.5 font-mincho text-sm text-[#f0eadc] placeholder-[#635f54] focus:outline-none focus:border-[#7a7568] disabled:opacity-50 transition-colors"
                />
                <button
                  onClick={() => sendQuestion(input)}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 bg-[#b3402f]/10 border border-[#b3402f]/20 rounded-sm flex items-center justify-center text-[#b3402f] hover:bg-[#b3402f]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB — height is auto (not fixed) so the vertical label always has room to fit.
          Hidden on mobile while the full-screen sheet is open (its own X handles close). */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        className={`fixed top-1/2 -translate-y-1/2 right-0 z-40 w-11 py-5 bg-[#b3402f] rounded-l-sm flex flex-col items-center justify-center gap-2 shadow-lg hover:bg-[#942f22] transition-colors ${open ? 'hidden lg:flex' : 'flex'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={16} className="text-[#f0eadc]" /></motion.div>
            : <motion.div key="spark" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2">
                <Sparkles size={16} className="text-[#f0eadc] shrink-0" />
                <span className="font-mincho text-[#f0eadc] text-[10px] tracking-[2px] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">MATPEAK COACH</span>
              </motion.div>
          }
        </AnimatePresence>
      </motion.button>
    </>
  )
}
