'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles, Lock } from 'lucide-react'

const DEMO_MESSAGES = [
  { role: 'ai', text: "Hey! I'm your AI Coach. I analyse every class you attend and can answer questions about techniques your coaches taught. Ask me anything." },
]

const SUGGESTED = [
  'What did my coach teach about half guard?',
  'Summarise my last class',
  'What techniques should I drill this week?',
]

export default function AICoachButton() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(DEMO_MESSAGES)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = () => { setOpen(true) }
    window.addEventListener('open-ai-coach', handler)
    return () => window.removeEventListener('open-ai-coach', handler)
  }, [])

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  function handleSend() {
    if (!input.trim()) return
    const userMsg = { role: 'user', text: input.trim() }
    setMessages(p => [...p, userMsg])
    setInput('')
    // Simulate locked response
    setTimeout(() => {
      setMessages(p => [...p, {
        role: 'ai',
        text: '🔒 AI Coach is coming soon. Once live, I\'ll answer this using transcripts from your actual classes — with timestamps.',
      }])
    }, 800)
  }

  function handleSuggestion(s: string) {
    setMessages(p => [...p, { role: 'user', text: s }])
    setTimeout(() => {
      setMessages(p => [...p, {
        role: 'ai',
        text: '🔒 AI Coach is coming soon. Once live, I\'ll answer this using transcripts from your actual classes — with timestamps.',
      }])
    }, 800)
  }

  return (
    <>
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 -translate-y-1/2 right-14 z-50 w-[340px] bg-[#1A1A1A] border border-[#333333] rounded-sm shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 80px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A] bg-[#0D0D0D] shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-sm bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 flex items-center justify-center">
                  <Sparkles size={12} className="text-[#FF3B3B]" />
                </div>
                <div>
                  <p className="font-bebas text-sm text-white tracking-[1px]">AI COACH</p>
                  <p className="font-inter text-[10px] text-[#555555]">Knows every class you attended</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-inter text-[10px] text-[#FF3B3B] tracking-[2px] uppercase border border-[#FF3B3B]/20 bg-[#FF3B3B]/5 px-2 py-0.5 rounded-sm">
                  Coming Soon
                </span>
                <button onClick={() => setOpen(false)} className="text-[#555555] hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[200px]">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] px-3 py-2.5 rounded-sm font-inter text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 text-white'
                      : 'bg-[#0D0D0D] border border-[#2A2A2A] text-[#cccccc]'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-3 flex flex-col gap-1.5 shrink-0">
                {SUGGESTED.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="text-left px-3 py-2 border border-[#333333] rounded-sm font-inter text-xs text-[#999999] hover:border-[#555555] hover:text-white transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-[#2A2A2A] shrink-0">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about your classes…"
                  className="flex-1 bg-[#0D0D0D] border border-[#333333] rounded-sm px-3 py-2 font-inter text-sm text-white placeholder-[#444444] focus:outline-none focus:border-[#555555] transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-8 h-8 bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 rounded-sm flex items-center justify-center text-[#FF3B3B] hover:bg-[#FF3B3B]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  <Send size={13} />
                </button>
              </div>
              <p className="font-inter text-[10px] text-[#444444] mt-2 flex items-center gap-1">
                <Lock size={9} /> Full AI responses unlock with AI Coach
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={() => { setOpen(v => !v); setPulse(false) }}
        className="fixed top-1/2 -translate-y-1/2 right-0 z-50 w-12 h-20 bg-[#FF3B3B] rounded-l-sm flex flex-col items-center justify-center gap-1 shadow-lg hover:bg-[#cc2f2f] transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={16} className="text-white" /></motion.div>
            : <motion.div key="spark" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-1">
                <Sparkles size={16} className="text-white" />
                <span className="font-bebas text-white text-[10px] tracking-[2px] [writing-mode:vertical-rl] rotate-180">AI COACH</span>
              </motion.div>
          }
        </AnimatePresence>
      </motion.button>
    </>
  )
}
