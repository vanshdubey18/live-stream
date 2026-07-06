'use client'

import { useState } from 'react'
import { ExternalLink, Plus, CheckCircle, Clock, Radio, AlertTriangle, UserPlus, ArrowRight, Trash2, Download, X, RefreshCw } from 'lucide-react'
import GymSidebar from '@/components/layout/GymSidebar'
import StatsCard from '@/components/gym-dashboard/StatsCard'
import StreamSetupCard from '@/components/gym-dashboard/StreamSetupCard'
import ScheduleClassModal, { type ScheduledClass } from '@/components/gym-dashboard/ScheduleClassModal'
import Toast from '@/components/gym-dashboard/Toast'
import { isSessionLive } from '@/lib/session-live'

interface MemberStats {
  active: number
  expiringSoon: number
  newThisWeek: number
}

interface Props {
  gym: any
  ownerName: string
  sessions: any[]
  coaches: any[]
  memberCount: number
  memberStats: MemberStats
  payouts: any[]
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatPaise(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'live') {
    return (
      <span className="font-mincho tracking-[1px] text-[#b3402f] text-sm flex items-center gap-1.5">
        ● LIVE
      </span>
    )
  }
  if (status === 'ended') {
    return (
      <span className="font-mincho tracking-[1px] text-[#a29c8c] text-sm">ENDED</span>
    )
  }
  return (
    <span className="font-mincho tracking-[1px] text-[#f0eadc] text-sm">SCHEDULED</span>
  )
}

function formatRelTime(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  const mins = Math.round(diff / 60000)
  if (mins < 0) return 'now'
  if (mins < 60) return `in ${mins}m`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `in ${hrs}h`
  return `in ${Math.round(hrs / 24)}d`
}

// ─── Clip Banner ───────────────────────────────────────────────────────────────
function ClipBanner({ session, onDismiss }: { session: any; onDismiss: (id: string) => void }) {
  const [retrying, setRetrying] = useState(false)
  const [retried, setRetried] = useState(false)

  const endedAt = session.scheduled_at ? new Date(session.scheduled_at).getTime() : 0
  const stale = Date.now() - endedAt > 30 * 60 * 1000
  const showRetry = session.clip_status === 'failed' || (session.clip_status === 'pending' && stale)

  async function handleRetry() {
    setRetrying(true)
    await fetch('/api/gym/retry-clip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: session.id }),
    })
    setRetrying(false)
    setRetried(true)
  }

  async function handleDismiss() {
    await fetch('/api/gym/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: session.id, clip_banner_dismissed: true }),
    })
    onDismiss(session.id)
  }

  if (session.clip_status !== 'ready' && !showRetry) return null

  return (
    <div className="bg-[#1c1c16] border border-[#b3402f]/30 rounded-sm px-5 py-4 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-mincho text-lg text-[#f0eadc] tracking-[1px] leading-none mb-1">
          {session.clip_status === 'ready' ? 'YOUR PREVIEW CLIP IS READY' : 'CLIP PROCESSING'}
        </p>
        <p className="font-mincho text-[#a29c8c] text-xs truncate">
          {session.clip_status === 'ready'
            ? `${session.title} — first 60 seconds`
            : showRetry ? 'Taking longer than expected' : 'Encoding in progress…'}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {session.clip_status === 'ready' && session.clip_url && (
          <a
            href={session.clip_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mincho tracking-[2px] text-sm text-[#b3402f] hover:text-[#f0eadc] transition-colors"
          >
            <Download size={13} /> DOWNLOAD
          </a>
        )}
        {showRetry && (
          <button
            onClick={handleRetry}
            disabled={retrying || retried}
            className="flex items-center gap-1.5 font-mincho text-xs text-[#a29c8c] border border-[#322f26] hover:border-[#7a7568] px-3 py-1.5 rounded-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw size={11} className={retrying ? 'animate-spin' : ''} />
            {retried ? 'Requested' : retrying ? 'Retrying…' : 'Retry clip'}
          </button>
        )}
        {session.clip_status === 'ready' && (
          <button onClick={handleDismiss} className="text-[#7a7568] hover:text-[#f0eadc] transition-colors ml-1">
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Action Items ──────────────────────────────────────────────────────────────
// The "what needs my attention today" row — the first thing the owner sees.
function ActionItems({
  liveSession, nextSession, expiringSoon, newThisWeek, setupNeeds, onGoLive,
}: {
  liveSession: any | null
  nextSession: any | null
  expiringSoon: number
  newThisWeek: number
  setupNeeds: string[]
  onGoLive: (id: string) => void
}) {
  type Item = {
    key: string
    tone: 'live' | 'warn' | 'info' | 'setup'
    icon: React.ReactNode
    title: string
    sub: string
    cta?: { label: string; onClick?: () => void; href?: string }
  }
  const items: Item[] = []

  if (liveSession) {
    items.push({
      key: 'live', tone: 'live', icon: <Radio size={15} />,
      title: `${liveSession.title} is live`,
      sub: 'Your class is streaming right now',
      cta: { label: 'Manage', onClick: () => onGoLive(liveSession.id) },
    })
  } else if (nextSession) {
    items.push({
      key: 'next', tone: 'info', icon: <Clock size={15} />,
      title: `${nextSession.title} starts ${formatRelTime(nextSession.scheduled_at)}`,
      sub: 'Get ready to go live',
      cta: { label: 'Go Live', onClick: () => onGoLive(nextSession.id) },
    })
  }

  if (expiringSoon > 0) {
    items.push({
      key: 'expiring', tone: 'warn', icon: <AlertTriangle size={15} />,
      title: `${expiringSoon} member${expiringSoon > 1 ? 's' : ''} expiring this week`,
      sub: 'Reach out before their membership lapses',
    })
  }

  if (newThisWeek > 0) {
    items.push({
      key: 'new', tone: 'info', icon: <UserPlus size={15} />,
      title: `${newThisWeek} new member${newThisWeek > 1 ? 's' : ''} this week`,
      sub: 'Welcome them to your gym',
    })
  }

  for (const need of setupNeeds) {
    items.push({
      key: `setup-${need}`, tone: 'setup', icon: <AlertTriangle size={15} />,
      title: need === 'logo' ? 'Add your gym logo' : need === 'coaches' ? 'Add your first coach' : 'Schedule your first class',
      sub: 'Finish setting up your gym',
      cta: {
        label: 'Set up',
        href: need === 'logo' ? '/gym-dashboard/profile' : need === 'coaches' ? '/gym-dashboard/coaches' : undefined,
      },
    })
  }

  if (items.length === 0) {
    items.push({
      key: 'all-clear', tone: 'info', icon: <CheckCircle size={15} />,
      title: 'All caught up',
      sub: 'No actions need your attention right now',
    })
  }

  const toneStyles: Record<Item['tone'], { dot: string; icon: string; border: string }> = {
    live: { dot: 'bg-[#b3402f]', icon: 'text-[#b3402f]', border: 'border-[#b3402f]/30' },
    warn: { dot: 'bg-[#FFD60A]', icon: 'text-[#FFD60A]', border: 'border-[#FFD60A]/20' },
    info: { dot: 'bg-[#7a7568]', icon: 'text-[#a29c8c]', border: 'border-[#322f26]' },
    setup: { dot: 'bg-[#FFD60A]', icon: 'text-[#FFD60A]', border: 'border-[#322f26]' },
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-5 h-px bg-[#b3402f]" />
        <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">Needs Your Attention</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map(item => {
          const s = toneStyles[item.tone]
          return (
            <div
              key={item.key}
              className={`bg-[#1c1c16] border ${s.border} rounded-sm px-4 py-4 flex items-center gap-3 ${item.tone === 'live' ? 'live-pulse-border' : ''}`}
            >
              <span className={`shrink-0 ${s.icon}`}>{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-mincho text-[#f0eadc] text-sm font-medium truncate">{item.title}</p>
                <p className="font-mincho text-[#7a7568] text-xs mt-0.5 truncate">{item.sub}</p>
              </div>
              {item.cta && (item.cta.href ? (
                <a
                  href={item.cta.href}
                  className="shrink-0 flex items-center gap-1 font-mincho tracking-[2px] text-sm text-[#141410] bg-[#f0eadc] hover:bg-[#e4dcc8] px-3 py-1.5 rounded-sm transition-colors"
                >
                  {item.cta.label} <ArrowRight size={12} />
                </a>
              ) : item.cta.onClick ? (
                <button
                  onClick={item.cta.onClick}
                  className={`shrink-0 font-mincho tracking-[2px] text-sm px-3 py-1.5 rounded-sm transition-colors ${
                    item.tone === 'live'
                      ? 'bg-[#b3402f] text-[#f0eadc] hover:bg-[#942f22]'
                      : 'bg-[#f0eadc] text-[#141410] hover:bg-[#e4dcc8]'
                  }`}
                >
                  {item.cta.label}
                </button>
              ) : null)}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default function GymDashboardClient({ gym, ownerName, sessions, coaches, memberCount, memberStats, payouts }: Props) {
  const [localSessions, setLocalSessions] = useState<any[]>(sessions)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState('')

  const completedCount = localSessions.filter(s => s.status === 'ended').length
  const scheduledCount = localSessions.filter(s => s.status === 'scheduled').length
  const totalRevenue = Math.round(memberCount * (gym.monthly_price_paise ?? 99900) * 0.7 / 100)

  // Action-item inputs
  const liveSession = localSessions.find(s => isSessionLive(s)) ?? null
  const nextSession = localSessions
    .filter(s => s.status === 'scheduled' && s.scheduled_at && new Date(s.scheduled_at).getTime() > Date.now())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0] ?? null

  const setupNeeds: string[] = []
  if (!gym.logo_url) setupNeeds.push('logo')
  if (coaches.length === 0) setupNeeds.push('coaches')
  if (localSessions.length === 0) setupNeeds.push('sessions')

  function handleScheduled(cls: ScheduledClass) {
    setLocalSessions(p => [cls, ...p])
    setToast('Class scheduled ✓')
  }

  async function handleDelete(id: string) {
    await fetch('/api/gym/session', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setLocalSessions(p => p.filter(c => c.id !== id))
    setToast('Class removed')
  }

  function handleGoLive(id: string) {
    window.location.href = `/gym-dashboard/stream?session_id=${id}`
  }

  function handleClipDismissed(id: string) {
    setLocalSessions(p => p.map(s => s.id === id ? { ...s, clip_banner_dismissed: true } : s))
  }

  const clipSessions = localSessions.filter(s =>
    s.status === 'ended' &&
    !s.clip_banner_dismissed &&
    (s.clip_status === 'ready' || s.clip_status === 'pending' || s.clip_status === 'failed')
  )

  return (
    <div className="min-h-screen bg-[#141410] flex">
      <GymSidebar active="Overview" />

      <main className="flex-1 lg:ml-64 min-w-0">

        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-[#141410] border-b border-[#242420] px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <div>
            <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Dashboard</p>
            <h1 className="font-mincho text-xl text-[#f0eadc] tracking-[1px] leading-tight">
              {ownerName.split(' ')[0]} — {gym.name}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className={`hidden sm:flex items-center gap-1.5 font-mincho text-[11px] tracking-[3px] uppercase
              ${gym.status === 'active' ? 'text-[#00D4AA]' : 'text-[#FFD60A]'}`}>
              <span className={`w-1.5 h-1.5 rounded-sm ${gym.status === 'active' ? 'bg-[#00D4AA]' : 'bg-[#FFD60A]'}`} />
              {gym.status === 'active' ? 'ACTIVE' : 'PENDING'}
            </span>
            {gym.status === 'active' && (
              <a
                href={`/gyms/${gym.slug}`}
                className="hidden sm:flex items-center gap-1.5 font-mincho text-[11px] text-[#7a7568] hover:text-[#f0eadc] tracking-[2px] uppercase transition-colors"
              >
                View Page <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>

        <div className="px-6 py-8 space-y-8 max-w-5xl">

          {/* Clip banners — one per ready/failed clip */}
          {clipSessions.map(s => (
            <ClipBanner key={s.id} session={s} onDismiss={handleClipDismissed} />
          ))}

          {/* Action items — first thing the owner sees */}
          <ActionItems
            liveSession={liveSession}
            nextSession={nextSession}
            expiringSoon={memberStats.expiringSoon}
            newThisWeek={memberStats.newThisWeek}
            setupNeeds={setupNeeds}
            onGoLive={handleGoLive}
          />

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute -inset-4 bg-[#b3402f]/[0.06] blur-[32px] rounded-full pointer-events-none" />
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#b3402f] z-10 shadow-[0_0_8px_1px_rgba(255,59,59,0.5)]" />
              <StatsCard
                label="Members"
                value={String(memberCount)}
                sub={memberStats.newThisWeek > 0 ? `+${memberStats.newThisWeek} this week` : 'Active memberships'}
              />
            </div>
            <StatsCard
              label="Est. Revenue (₹)"
              value={`₹${totalRevenue.toLocaleString('en-IN')}`}
              sub="Your 70% share (est.)"
            />
            <StatsCard
              label="Expiring Soon"
              value={String(memberStats.expiringSoon)}
              sub={memberStats.expiringSoon > 0 ? 'Within 7 days — remind them' : 'None this week'}
            />
            <StatsCard
              label="Sessions"
              value={String(localSessions.length)}
              sub={`${completedCount} ended · ${scheduledCount} scheduled`}
            />
          </div>

          {/* Stream Setup */}
          <StreamSetupCard gymId={gym.id} />

          {/* Sessions */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-px bg-[#b3402f]" />
                <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">Sessions</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-[#f0eadc] hover:bg-[#e4dcc8] text-[#141410] font-mincho tracking-[3px] text-sm px-5 py-2 rounded-sm transition-colors"
              >
                <Plus size={14} /> Schedule Class
              </button>
            </div>

            {localSessions.length === 0 ? (
              <div className="relative bg-[#1c1c16] border border-[#322f26] rounded-sm px-6 py-12 text-center overflow-hidden">
                <span className="absolute inset-0 flex items-center justify-center font-mincho text-[120px] text-[#f0eadc]/[0.03] leading-none select-none pointer-events-none">LIVE</span>
                <p className="relative font-mincho text-[#7a7568] text-sm mb-5">No sessions scheduled yet.</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="relative bg-[#f0eadc] hover:bg-[#e4dcc8] text-[#141410] font-mincho tracking-[3px] text-sm px-6 py-2.5 rounded-sm transition-colors"
                >
                  Schedule First Class
                </button>
              </div>
            ) : (
              <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm overflow-hidden">

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#322f26]">
                        {['Title', 'Discipline', 'Date / Time', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-3 text-left font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {localSessions.map((s: any, i: number) => (
                        <tr
                          key={s.id}
                          className={`hover:bg-[#242420] transition-colors ${i < localSessions.length - 1 ? 'border-b border-[#242420]' : ''}`}
                        >
                          <td className="px-5 py-4 font-mincho text-[#f0eadc] text-sm font-medium">{s.title}</td>
                          <td className="px-5 py-4">
                            <span className="font-mincho text-[11px] text-[#a29c8c] tracking-[2px] uppercase">
                              {s.discipline}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-mincho text-[#a29c8c] text-sm whitespace-nowrap">
                            {s.scheduled_at ? formatDateShort(s.scheduled_at) : s.date}
                            {' · '}
                            {s.scheduled_at ? formatTime(s.scheduled_at) : s.time}
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={s.status ?? 'scheduled'} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              {s.status !== 'ended' && (
                                <a
                                  href={`/gym-dashboard/stream?session_id=${s.id}`}
                                  className="font-mincho tracking-[2px] text-sm bg-[#f0eadc] text-[#141410] px-3 py-1 rounded-sm hover:bg-[#e4dcc8] transition-colors"
                                >
                                  {isSessionLive(s) ? 'MANAGE' : 'GO LIVE'}
                                </a>
                              )}
                              <button
                                onClick={() => handleDelete(s.id)}
                                className="w-7 h-7 flex items-center justify-center border border-[#322f26] text-[#7a7568] hover:text-[#f0eadc] hover:border-[#7a7568] rounded-sm transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile rows */}
                <div className="md:hidden divide-y divide-[#242420]">
                  {localSessions.map((s: any) => (
                    <div key={s.id} className="px-4 py-4 space-y-3 hover:bg-[#242420] transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-mincho text-[#f0eadc] text-sm font-medium">{s.title}</p>
                          <p className="font-mincho text-[#a29c8c] text-xs mt-0.5 tracking-[2px] uppercase">{s.discipline}</p>
                          <p className="font-mincho text-[#a29c8c] text-xs mt-0.5">
                            {s.scheduled_at ? formatDateShort(s.scheduled_at) : s.date}
                            {' · '}
                            {s.scheduled_at ? formatTime(s.scheduled_at) : s.time}
                          </p>
                        </div>
                        <StatusBadge status={s.status ?? 'scheduled'} />
                      </div>
                      <div className="flex gap-2">
                        {s.status !== 'ended' && (
                          <a
                            href={`/gym-dashboard/stream?session_id=${s.id}`}
                            className="font-mincho tracking-[2px] text-sm bg-[#f0eadc] text-[#141410] px-4 py-1.5 rounded-sm hover:bg-[#e4dcc8] transition-colors"
                          >
                            {isSessionLive(s) ? 'MANAGE' : 'GO LIVE'}
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="flex items-center gap-1.5 border border-[#322f26] text-[#7a7568] hover:text-[#f0eadc] font-mincho text-xs px-3 py-1.5 rounded-sm transition-all"
                        >
                          <Trash2 size={11} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </section>

          {/* Payouts */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-px bg-[#b3402f]" />
              <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">Recent Payouts</p>
            </div>
            {payouts.length === 0 ? (
              <div className="relative bg-[#1c1c16] border border-[#322f26] rounded-sm px-6 py-8 text-center overflow-hidden">
                <span className="absolute inset-0 flex items-center justify-center font-mincho text-[120px] text-[#f0eadc]/[0.03] leading-none select-none pointer-events-none">EARN</span>
                <p className="relative font-mincho text-[#7a7568] text-sm">No payouts yet.</p>
              </div>
            ) : (
              <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm overflow-hidden">
                {/* Desktop table */}
                <table className="hidden sm:table w-full">
                  <thead>
                    <tr className="border-b border-[#322f26]">
                      {['Period', 'Amount (70%)', 'Status'].map(h => (
                        <th key={h} className="px-5 py-3 text-left font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p: any, i: number) => (
                      <tr
                        key={p.id}
                        className={`hover:bg-[#242420] transition-colors ${i < payouts.length - 1 ? 'border-b border-[#242420]' : ''}`}
                      >
                        <td className="px-5 py-4 font-mincho text-[#f0eadc] text-sm">
                          {new Date(p.period_start).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4 font-mincho text-[#f0eadc] text-xl tracking-[1px]">
                          {formatPaise(p.amount_paise)}
                        </td>
                        <td className="px-5 py-4">
                          {p.status === 'paid' ? (
                            <span className="flex items-center gap-1.5 font-mincho text-[#00D4AA] text-xs">
                              <CheckCircle size={12} /> PAID
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 font-mincho text-[#FFD60A] text-xs">
                              <Clock size={12} /> PENDING
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Mobile cards */}
                <div className="sm:hidden divide-y divide-[#242420]">
                  {payouts.map((p: any) => (
                    <div key={p.id} className="px-5 py-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-mincho text-[#f0eadc] text-sm">
                          {new Date(p.period_start).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                        </p>
                        <p className={`font-mincho text-xs mt-1 ${p.status === 'paid' ? 'text-[#00D4AA]' : 'text-[#FFD60A]'}`}>
                          {p.status === 'paid' ? 'PAID' : 'PENDING'}
                        </p>
                      </div>
                      <p className="font-mincho text-[#f0eadc] text-xl tracking-[1px]">{formatPaise(p.amount_paise)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

        </div>
      </main>

      {showModal && (
        <ScheduleClassModal
          coaches={coaches.map((c: any) => ({ id: c.id, name: c.name }))}
          onClose={() => setShowModal(false)}
          onScheduled={handleScheduled}
        />
      )}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
