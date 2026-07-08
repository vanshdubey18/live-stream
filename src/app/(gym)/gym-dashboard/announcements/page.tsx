'use client'

import { useState, useEffect } from 'react'
import { Megaphone, Trash2, Send } from 'lucide-react'
import GymSidebar from '@/components/layout/GymSidebar'
import Toast from '@/components/gym-dashboard/Toast'
import EmptyState from '@/components/ui/EmptyState'

interface Announcement {
  id: string
  body: string
  created_at: string
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })
}

const MAX_LEN = 500

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loaded, setLoaded] = useState(false)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetch('/api/gym/announcements')
      .then(r => r.json())
      .then(d => { if (d.announcements) setAnnouncements(d.announcements) })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!body.trim()) return
    setSending(true)
    try {
      const res = await fetch('/api/gym/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
      setAnnouncements(p => [data.announcement, ...p])
      setBody('')
      setToast('Sent to your members ✓')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  async function handleDelete(id: string) {
    setAnnouncements(p => p.filter(a => a.id !== id))
    const res = await fetch(`/api/gym/announcements/${id}`, { method: 'DELETE' })
    if (!res.ok) setToast('Failed to delete')
  }

  return (
    <div className="min-h-screen bg-[#141410] flex">
      <GymSidebar active="Announcements" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#141410] border-b border-[#322f26] px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <div>
            <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Gym Dashboard</p>
            <h1 className="font-mincho text-xl text-[#f0eadc] tracking-[1px] leading-tight">Announcements</h1>
          </div>
        </div>

        <div className="px-6 py-8 max-w-2xl space-y-8">

          {/* Composer */}
          <form onSubmit={handleSend} className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-px bg-[#b3402f]" />
              <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">New Announcement</p>
            </div>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              maxLength={MAX_LEN}
              rows={3}
              placeholder="e.g. Monday 6pm BJJ class is cancelled — see you Wednesday instead."
              className="w-full bg-[#141410] border border-[#322f26] rounded-sm px-4 py-3 text-[#f0eadc] text-sm font-mincho placeholder-[#635f54] focus:outline-none focus:border-[#7a7568] transition-colors resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="font-mincho text-[11px] text-[#635f54]">{body.length}/{MAX_LEN} · goes to every active member</span>
              <button
                type="submit"
                disabled={sending || !body.trim()}
                className="flex items-center gap-2 bg-[#b3402f] hover:bg-[#942f22] disabled:opacity-40 disabled:cursor-not-allowed text-[#f0eadc] font-mincho tracking-[2px] text-sm px-5 py-2.5 rounded-sm transition-colors"
              >
                <Send size={14} /> {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
            {error && (
              <p className="font-mincho text-sm text-[#b3402f] bg-[#b3402f]/5 border border-[#b3402f]/20 rounded-sm px-4 py-3 mt-3">
                {error}
              </p>
            )}
          </form>

          {/* History */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-px bg-[#b3402f]" />
              <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">Sent</p>
            </div>

            {!loaded ? null : announcements.length === 0 ? (
              <EmptyState ghost="NOTIFY" message="No announcements sent yet. Members won't know about schedule changes unless you tell them." />
            ) : (
              <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm divide-y divide-[#242420]">
                {announcements.map(a => (
                  <div key={a.id} className="px-5 py-4 flex items-start gap-3">
                    <Megaphone size={15} className="text-[#7a7568] mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mincho text-[#f0eadc] text-sm leading-relaxed">{a.body}</p>
                      <p className="font-mincho text-[11px] text-[#7a7568] mt-1.5">{formatDateTime(a.created_at)}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="shrink-0 w-7 h-7 flex items-center justify-center border border-[#322f26] text-[#7a7568] hover:text-[#b3402f] hover:border-[#b3402f] rounded-sm transition-all"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
