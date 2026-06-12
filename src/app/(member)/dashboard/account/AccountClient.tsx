'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Eye, EyeOff, LogOut, CheckCircle2 } from 'lucide-react'

interface GymSummary {
  id: string
  name: string
  slug: string
  accessUntil: string | null
  accessExpired: boolean
}

interface AccountClientProps {
  email: string
  name: string
  phone: string
  gyms: GymSummary[]
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-5 h-px bg-[#FF3B3B]" />
      <p className="font-inter text-[11px] text-[#FF3B3B] tracking-[4px] uppercase">{label}</p>
    </div>
  )
}

const inputClass =
  'font-inter w-full bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-3 text-white placeholder-[#555555] text-sm focus:outline-none focus:border-white transition-colors duration-150'

const labelClass = 'block font-bebas tracking-[2px] text-white text-sm mb-2'

export default function AccountClient({ email, name: initialName, phone: initialPhone, gyms }: AccountClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [toast, setToast] = useState('')
  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // ── Profile ──
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileError('')
    if (!name.trim()) { setProfileError('Name cannot be empty.'); return }
    setProfileSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')
      const [{ error: dbError }, { error: authError }] = await Promise.all([
        supabase.from('users').update({ name: name.trim(), phone: phone.trim() || null }).eq('id', user.id),
        supabase.auth.updateUser({ data: { full_name: name.trim() } }),
      ])
      if (dbError) throw dbError
      if (authError) throw authError
      showToast('Profile saved')
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Failed to save profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  // ── Password ──
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    if (password.length < 8) { setPasswordError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setPasswordError('Passwords do not match.'); return }
    setPasswordSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setPassword('')
      setConfirm('')
      showToast('Password updated')
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password.')
    } finally {
      setPasswordSaving(false)
    }
  }

  // ── Session ──
  const [signingOut, setSigningOut] = useState(false)

  async function signOutEverywhere() {
    setSigningOut(true)
    await supabase.auth.signOut({ scope: 'global' })
    router.push('/login')
  }

  return (
    <div className="flex-1 min-h-screen bg-[#0D0D0D] lg:pl-64">
      <div className="pt-14 lg:pt-0">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-10">

          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-5 h-px bg-[#FF3B3B]" />
              <p className="font-inter text-[11px] text-[#FF3B3B] tracking-[4px] uppercase">Settings</p>
            </div>
            <h1 className="font-bebas text-4xl text-white tracking-[1px]">ACCOUNT</h1>
          </div>

          {/* Profile */}
          <section>
            <SectionHeader label="Profile" />
            <form onSubmit={saveProfile} className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-6 space-y-5">
              <div>
                <label className={labelClass}>NAME</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setProfileError('') }}
                  placeholder="Your name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>PHONE</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setProfileError('') }}
                  placeholder="+91"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>EMAIL</label>
                <input type="email" value={email} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
                <p className="font-inter text-[11px] text-[#555555] mt-1.5">Contact support to change your email.</p>
              </div>
              {profileError && <p className="font-inter text-[#FF3B3B] text-sm">{profileError}</p>}
              <button
                type="submit"
                disabled={profileSaving}
                className="font-bebas tracking-[3px] w-full bg-white hover:bg-[#E5E5E5] disabled:opacity-40 disabled:cursor-not-allowed text-black py-3.5 rounded-sm text-sm transition-colors duration-150 flex items-center justify-center gap-2"
              >
                {profileSaving ? <Loader2 size={16} className="animate-spin" /> : 'SAVE PROFILE'}
              </button>
            </form>
          </section>

          {/* Password */}
          <section>
            <SectionHeader label="Password" />
            <form onSubmit={savePassword} className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-6 space-y-5">
              <div>
                <label className={labelClass}>NEW PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError('') }}
                    placeholder="At least 8 characters"
                    minLength={8}
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-white transition-colors duration-150"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>CONFIRM PASSWORD</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setPasswordError('') }}
                  placeholder="Repeat new password"
                  minLength={8}
                  className={inputClass}
                />
              </div>
              {passwordError && <p className="font-inter text-[#FF3B3B] text-sm">{passwordError}</p>}
              <button
                type="submit"
                disabled={passwordSaving || !password}
                className="font-bebas tracking-[3px] w-full bg-white hover:bg-[#E5E5E5] disabled:opacity-40 disabled:cursor-not-allowed text-black py-3.5 rounded-sm text-sm transition-colors duration-150 flex items-center justify-center gap-2"
              >
                {passwordSaving ? <Loader2 size={16} className="animate-spin" /> : 'UPDATE PASSWORD'}
              </button>
            </form>
          </section>

          {/* Memberships */}
          <section>
            <SectionHeader label="Memberships" />
            {gyms.length === 0 ? (
              <div className="relative bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-12 text-center overflow-hidden">
                <span className="absolute inset-0 flex items-center justify-center font-bebas text-[100px] text-white/[0.03] leading-none select-none pointer-events-none">
                  GYMS
                </span>
                <p className="relative font-inter text-[#555555] text-sm">You haven&apos;t joined a gym yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-px bg-[#333333] border border-[#333333] rounded-sm overflow-hidden">
                {gyms.map((g) => (
                  <a
                    key={g.id}
                    href={`/gyms/${g.slug}`}
                    className="bg-[#1A1A1A] hover:bg-[#222222] px-5 py-4 flex items-center justify-between transition-colors duration-150"
                  >
                    <div>
                      <p className="font-bebas text-lg text-white tracking-[1px]">{g.name}</p>
                      {g.accessUntil && (
                        <p className="font-inter text-xs text-[#555555] mt-0.5">
                          Access {g.accessExpired ? 'ended' : 'until'}{' '}
                          {new Date(g.accessUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <span
                      className={`font-inter text-[10px] tracking-[2px] uppercase px-2 py-1 rounded-sm border ${
                        g.accessExpired
                          ? 'text-[#FFD60A] border-[#FFD60A]/30 bg-[#FFD60A]/5'
                          : 'text-[#00D4AA] border-[#00D4AA]/30 bg-[#00D4AA]/5'
                      }`}
                    >
                      {g.accessExpired ? 'Access Expired' : 'Active'}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Session */}
          <section>
            <SectionHeader label="Session" />
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-6 space-y-4">
              <button
                onClick={signOutEverywhere}
                disabled={signingOut}
                className="font-bebas tracking-[3px] w-full border border-[#333333] hover:border-[#FF3B3B]/50 hover:text-[#FF3B3B] disabled:opacity-40 text-white py-3.5 rounded-sm text-sm transition-colors duration-150 flex items-center justify-center gap-2"
              >
                {signingOut ? <Loader2 size={16} className="animate-spin" /> : (<><LogOut size={14} /> SIGN OUT OF ALL DEVICES</>)}
              </button>
              <p className="font-inter text-[11px] text-[#555555] text-center">
                To delete your account, contact support.
              </p>
            </div>
          </section>

        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] border border-[#333333] rounded-sm px-5 py-3 flex items-center gap-2.5 shadow-xl"
          >
            <CheckCircle2 size={15} className="text-[#00D4AA]" />
            <span className="font-inter text-sm text-white">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
