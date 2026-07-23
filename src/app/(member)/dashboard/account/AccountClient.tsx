'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Eye, EyeOff, LogOut, CheckCircle2, Download, Trash2, X } from 'lucide-react'

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
      <div className="w-5 h-px bg-[#b3402f]" />
      <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">{label}</p>
    </div>
  )
}

const inputClass =
  'font-mincho w-full bg-[#141410] border border-[#322f26] rounded-sm px-4 py-3 text-[#f0eadc] placeholder-[#7a7568] text-sm focus:outline-none focus:border-[#f0eadc] transition-colors duration-150'

const labelClass = 'block font-mincho tracking-[2px] text-[#f0eadc] text-sm mb-2'

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

  // ── Data export ──
  const [exporting, setExporting] = useState(false)

  async function exportData() {
    setExporting(true)
    try {
      const res = await fetch('/api/member/account/export')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'matpeak-data-export.json'
      a.click()
      URL.revokeObjectURL(url)
      showToast('Export downloaded')
    } catch {
      showToast('Export failed — try again')
    } finally {
      setExporting(false)
    }
  }

  // ── Account deletion ──
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function deleteAccount() {
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch('/api/member/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: deleteConfirmText }),
      })
      const data = await res.json()
      if (!res.ok) { setDeleteError(data.error ?? 'Failed to delete account'); return }
      await supabase.auth.signOut({ scope: 'global' })
      router.push('/login')
    } catch {
      setDeleteError('Network error — try again')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex-1 min-h-screen bg-[#141410] lg:pl-64">
      <div className="pt-14 lg:pt-0">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-10">

          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-5 h-px bg-[#b3402f]" />
              <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">Settings</p>
            </div>
            <h1 className="font-mincho text-4xl text-[#f0eadc] tracking-[1px]">ACCOUNT</h1>
          </div>

          {/* Profile */}
          <section>
            <SectionHeader label="Profile" />
            <form onSubmit={saveProfile} className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-6 space-y-5">
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
                <p className="font-mincho text-[11px] text-[#7a7568] mt-1.5">Contact support to change your email.</p>
              </div>
              {profileError && <p className="font-mincho text-[#b3402f] text-sm">{profileError}</p>}
              <button
                type="submit"
                disabled={profileSaving}
                className="font-mincho tracking-[3px] w-full bg-[#f0eadc] hover:bg-[#e4dcc8] disabled:opacity-40 disabled:cursor-not-allowed text-[#141410] py-3.5 rounded-sm text-sm transition-colors duration-150 flex items-center justify-center gap-2"
              >
                {profileSaving ? <Loader2 size={16} className="animate-spin" /> : 'SAVE PROFILE'}
              </button>
            </form>
          </section>

          {/* Password */}
          <section>
            <SectionHeader label="Password" />
            <form onSubmit={savePassword} className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-6 space-y-5">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7568] hover:text-[#f0eadc] transition-colors duration-150"
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
              {passwordError && <p className="font-mincho text-[#b3402f] text-sm">{passwordError}</p>}
              <button
                type="submit"
                disabled={passwordSaving || !password}
                className="font-mincho tracking-[3px] w-full bg-[#f0eadc] hover:bg-[#e4dcc8] disabled:opacity-40 disabled:cursor-not-allowed text-[#141410] py-3.5 rounded-sm text-sm transition-colors duration-150 flex items-center justify-center gap-2"
              >
                {passwordSaving ? <Loader2 size={16} className="animate-spin" /> : 'UPDATE PASSWORD'}
              </button>
            </form>
          </section>

          {/* Memberships */}
          <section>
            <SectionHeader label="Memberships" />
            {gyms.length === 0 ? (
              <div className="relative bg-[#1c1c16] border border-[#322f26] rounded-sm px-6 py-12 text-center overflow-hidden">
                <span className="absolute inset-0 flex items-center justify-center font-mincho text-[100px] text-[#f0eadc]/[0.03] leading-none select-none pointer-events-none">
                  GYMS
                </span>
                <p className="relative font-mincho text-[#7a7568] text-sm">You haven&apos;t joined a gym yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-px bg-[#322f26] border border-[#322f26] rounded-sm overflow-hidden">
                {gyms.map((g) => (
                  <a
                    key={g.id}
                    href={`/gyms/${g.slug}`}
                    className="bg-[#1c1c16] hover:bg-[#242420] px-5 py-4 flex items-center justify-between transition-colors duration-150"
                  >
                    <div>
                      <p className="font-mincho text-lg text-[#f0eadc] tracking-[1px]">{g.name}</p>
                      {g.accessUntil && (
                        <p className="font-mincho text-xs text-[#7a7568] mt-0.5">
                          Access {g.accessExpired ? 'ended' : 'until'}{' '}
                          {new Date(g.accessUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <span
                      className={`font-mincho text-[10px] tracking-[2px] uppercase px-2 py-1 rounded-sm border ${
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
            <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-6 space-y-4">
              <button
                onClick={signOutEverywhere}
                disabled={signingOut}
                className="font-mincho tracking-[3px] w-full border border-[#322f26] hover:border-[#b3402f]/50 hover:text-[#b3402f] disabled:opacity-40 text-[#f0eadc] py-3.5 rounded-sm text-sm transition-colors duration-150 flex items-center justify-center gap-2"
              >
                {signingOut ? <Loader2 size={16} className="animate-spin" /> : (<><LogOut size={14} /> SIGN OUT OF ALL DEVICES</>)}
              </button>
            </div>
          </section>

          {/* Data & Privacy */}
          <section>
            <SectionHeader label="Data & Privacy" />
            <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-6 space-y-4">
              <div>
                <p className="font-mincho text-sm text-[#f0eadc] mb-1">Export your data</p>
                <p className="font-mincho text-xs text-[#7a7568] mb-3">Download everything MATPEAK has stored about your account as a JSON file.</p>
                <button
                  onClick={exportData}
                  disabled={exporting}
                  className="font-mincho tracking-[2px] border border-[#322f26] hover:border-[#7a7568] disabled:opacity-40 text-[#f0eadc] px-5 py-2.5 rounded-sm text-xs transition-colors duration-150 flex items-center gap-2"
                >
                  {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  DOWNLOAD MY DATA
                </button>
              </div>
              <div className="border-t border-[#2a2a20] pt-4">
                <p className="font-mincho text-sm text-[#b3402f] mb-1">Delete account</p>
                <p className="font-mincho text-xs text-[#7a7568] mb-3">Permanently deletes your account, memberships, and purchase history. This cannot be undone.</p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="font-mincho tracking-[2px] border border-[#b3402f]/30 hover:border-[#b3402f] hover:bg-[#b3402f]/10 text-[#b3402f] px-5 py-2.5 rounded-sm text-xs transition-colors duration-150 flex items-center gap-2"
                >
                  <Trash2 size={14} /> DELETE MY ACCOUNT
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/70" onClick={() => !deleting && setShowDeleteModal(false)} />
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="relative bg-[#1c1c16] border border-[#322f26] rounded-sm w-full max-w-md"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a20]">
                <h2 className="font-mincho text-xl text-[#f0eadc] tracking-[1px]">DELETE ACCOUNT</h2>
                {!deleting && (
                  <button onClick={() => setShowDeleteModal(false)} className="text-[#7a7568] hover:text-[#f0eadc]"><X size={20} /></button>
                )}
              </div>
              <div className="p-6 space-y-4">
                <p className="font-mincho text-sm text-[#a29c8c] leading-relaxed">
                  This permanently deletes your account, all gym memberships, purchase history, and watch history. This cannot be undone.
                </p>
                <div>
                  <label className="block font-mincho tracking-[2px] text-[#f0eadc] text-xs mb-2">
                    Type <span className="text-[#b3402f]">DELETE</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => { setDeleteConfirmText(e.target.value); setDeleteError('') }}
                    className={inputClass}
                    disabled={deleting}
                  />
                </div>
                {deleteError && <p className="font-mincho text-[#b3402f] text-sm">{deleteError}</p>}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleting}
                    className="flex-1 py-3 border border-[#322f26] text-[#f0eadc] text-sm font-mincho tracking-[2px] rounded-sm transition-all hover:bg-[#242420] disabled:opacity-50"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={deleteAccount}
                    disabled={deleting || deleteConfirmText !== 'DELETE'}
                    className="flex-1 py-3 bg-[#b3402f] hover:bg-[#942f22] disabled:opacity-40 disabled:cursor-not-allowed text-[#f0eadc] font-mincho tracking-[2px] text-sm rounded-sm transition-all flex items-center justify-center gap-2"
                  >
                    {deleting ? <Loader2 size={15} className="animate-spin" /> : 'DELETE FOREVER'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1c1c16] border border-[#322f26] rounded-sm px-5 py-3 flex items-center gap-2.5 shadow-xl"
          >
            <CheckCircle2 size={15} className="text-[#00D4AA]" />
            <span className="font-mincho text-sm text-[#f0eadc]">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
