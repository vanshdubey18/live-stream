'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'

function StatCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let start = 0
    const increment = end / (1200 / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, end])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? 'bg-[#141410] border-b border-[#322f26]' : 'bg-transparent'}`}>
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="font-mincho text-2xl tracking-[1px] text-[#f0eadc]">MAT<span className="text-[#b3402f]">PEAK</span></a>
        <div className="hidden md:flex items-center gap-8">
          {['#disciplines', '#how-it-works', '#pricing'].map((href, i) => (
            <a key={href} href={href} className="font-mincho text-sm text-[#7a7568] hover:text-[#f0eadc] transition-colors duration-150">
              {['Disciplines', 'How it works', 'Pricing'][i]}
            </a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <a href="/login" className="font-mincho text-sm text-[#7a7568] hover:text-[#f0eadc] transition-colors duration-150 px-4 py-2">Log in</a>
          <a href="/signup" className="font-mincho text-sm tracking-[2px] bg-[#f0eadc] text-[#141410] px-6 py-2.5 rounded-sm hover:bg-[#e4dcc8] transition-all duration-150">Start Training</a>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden text-[#a29c8c] hover:text-[#f0eadc]">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-[#141410] border-t border-[#322f26] px-6 py-6 flex flex-col gap-5">
          {[['#disciplines','Disciplines'],['#how-it-works','How it works'],['#pricing','Pricing']].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="font-mincho text-sm text-[#7a7568] hover:text-[#f0eadc] transition-colors">{label}</a>
          ))}
          <div className="border-t border-[#322f26] pt-5 flex flex-col gap-3">
            <a href="/login" className="font-mincho text-sm text-[#7a7568] hover:text-[#f0eadc]">Log in</a>
            <a href="/signup" className="font-mincho text-sm tracking-[2px] bg-[#f0eadc] text-[#141410] px-6 py-3 rounded-sm text-center hover:bg-[#e4dcc8] transition-all">Start Training</a>
          </div>
        </div>
      )}
    </nav>
  )
}

function Hero() {
  return (
    <section className="relative min-h-screen bg-[#141410] flex flex-col justify-between pt-16 overflow-hidden">

      {/* Full-bleed athlete photo */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/10006587/pexels-photo-10006587.jpeg?auto=compress&cs=tinysrgb&w=1600&h=1200&fit=crop"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-[78%_center] sm:object-center grayscale contrast-110 brightness-110"
        />
        {/* Subtle base dim — keep photo readable */}
        <div className="absolute inset-0 bg-black/35" />
        {/* Left gradient — text zone dark, athlete visible on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141410] via-[#141410]/40 to-transparent" />
        {/* Bottom fade into stat bar */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141410] via-[#141410]/20 to-transparent" style={{ top: '65%' }} />
        {/* Top fade into navbar */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#141410]/50 via-transparent to-transparent" style={{ bottom: '88%' }} />
        {/* Warm rust tint — brand feel */}
        <div className="absolute inset-0 bg-[#b3402f]/10 mix-blend-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-[1280px] mx-auto px-6 w-full py-14 lg:py-16">
          <div className="max-w-[620px]">

            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-6 h-px bg-[#b3402f]" />
              <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">
                Combat Sports &bull; Live Training
              </p>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }}
              className="font-mincho font-medium leading-[1] tracking-[.5px]"
              style={{ fontSize: 'clamp(60px, 8.5vw, 104px)' }}
            >
              <span className="block text-[#f0eadc]">World-class</span>
              <span className="block text-[#f0eadc]">training.</span>
              <span className="block text-[#b3402f]">Wherever you are.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut', delay: 0.12 }}
              className="font-mincho text-[#a29c8c] text-base mt-6 max-w-[400px] leading-relaxed"
            >
              Stream live classes from real MMA gyms.<br />
              BJJ. Boxing. Muay Thai. Wrestling.<br />
              Train from anywhere in the world.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut', delay: 0.18 }}
              className="flex flex-wrap items-center gap-3 mt-8"
            >
              <a href="/signup" className="font-mincho text-sm tracking-[2px] bg-[#f0eadc] text-[#141410] px-5 sm:px-8 py-3.5 sm:py-4 rounded-sm hover:bg-[#e4dcc8] transition-all duration-150 flex items-center gap-2">
                Start Training <ArrowRight size={14} />
              </a>
              <a href="/gyms" className="font-mincho text-sm text-[#a29c8c] border border-[#f0eadc]/20 px-5 sm:px-8 py-3.5 sm:py-[14px] rounded-sm hover:text-[#f0eadc] hover:border-[#f0eadc]/40 transition-all duration-150">
                Browse Gyms
              </a>
            </motion.div>

          </div>
        </div>
      </div>

      {/* "Train at the source" pill — bottom left, above stat bar */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="relative z-10 max-w-[1280px] mx-auto px-6 pb-4"
      >
        <span className="font-mincho text-[9px] text-[#b3402f] tracking-[3px] uppercase border border-[#b3402f]/30 bg-black/40 px-2.5 py-1.5 rounded-sm backdrop-blur-sm">
          Train at the source
        </span>
      </motion.div>

      {/* Stat bar */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.25, delay: 0.2, ease: 'easeOut' }}
        className="relative z-10 border-t border-[#322f26]"
      >
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-3 divide-x divide-[#322f26]">
            {[
              { value: 2400, suffix: '+', label: 'HOURS STREAMED' },
              { value: 47, suffix: '', label: 'COACHES' },
              { value: 8, suffix: '', label: 'DISCIPLINES' },
            ].map(({ value, suffix, label }) => (
              <div key={label} className="px-4 sm:px-6 lg:px-10 py-5 lg:py-6 first:pl-0">
                <div className="font-mincho text-4xl sm:text-5xl lg:text-6xl text-[#c9bda0] tracking-[.5px] leading-none">
                  <StatCounter end={value} suffix={suffix} />
                </div>
                <p className="font-mincho text-[10px] sm:text-[11px] text-[#7a7568] tracking-[3px] sm:tracking-[4px] uppercase mt-2">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}

const DISCIPLINES = [
  { name: 'BJJ',        full: 'Brazilian Jiu-Jitsu', desc: 'Ground control, submissions, guard play. The chess match of combat sports.',         count: '12 gyms' },
  { name: 'Boxing',     full: 'Boxing',              desc: 'Footwork, combinations, head movement. The sweet science.',                           count: '8 gyms'  },
  { name: 'Muay Thai',  full: 'Muay Thai',           desc: 'Eight limbs. Elbows, knees, clinch. The art of eight weapons.',                       count: '9 gyms'  },
  { name: 'Wrestling',  full: 'Wrestling',           desc: 'Takedowns, scrambles, top pressure. The foundation of MMA.',                         count: '5 gyms'  },
  { name: 'MMA',        full: 'Mixed Martial Arts',  desc: 'Stand-up, clinch, ground. The complete combat sport.',                               count: '7 gyms'  },
  { name: 'Kickboxing', full: 'Kickboxing',          desc: 'Punches and kicks in combination. Power, speed, and distance management.',           count: '4 gyms'  },
  { name: 'Judo',       full: 'Judo',                desc: 'Throws, trips, and pins. Explosive off-balance and control.',                        count: '3 gyms'  },
  { name: 'Sambo',      full: 'Sambo',               desc: 'Russian combat system — throws, leg locks, and ground work combined.',               count: '2 gyms'  },
]

function Disciplines() {
  return (
    <section id="disciplines" className="bg-[#141410] border-t border-[#322f26]">
      <div className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-[#b3402f]" />
            <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">What we stream</p>
          </div>
          <h2 className="font-mincho font-normal text-4xl lg:text-5xl text-[#f0eadc] tracking-[.5px] leading-tight">Every discipline.<br />One platform.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#322f26]">
          {DISCIPLINES.map(({ name, full, desc, count }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, ease: 'easeOut', delay: i * 0.04 }}
              whileHover={{ y: -2 }}
              className="bg-[#141410] p-8 group cursor-pointer hover:bg-[#18180f] transition-colors duration-150 border-t-2 border-transparent hover:border-[#b3402f]"
            >
              <span className="font-mincho text-[10px] text-[#7a7568] tracking-[3px] uppercase border border-[#322f26] px-2 py-0.5 rounded-sm">{count}</span>
              <h3 className="font-mincho font-normal text-3xl text-[#f0eadc] tracking-[.5px] leading-none mt-5 mb-2 group-hover:text-[#b3402f] transition-colors duration-150">{name}</h3>
              <p className="font-mincho text-xs text-[#7a7568] mb-1">{full}</p>
              <p className="font-mincho text-sm text-[#7a7568] leading-relaxed mt-2">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const STEPS = [
  { num: '01', title: 'Find your gym', desc: 'Browse verified gyms by discipline, city, or coach. Every gym is vetted.' },
  { num: '02', title: 'Join the stream', desc: 'Subscribe to a gym. Watch live classes in real-time from anywhere.' },
  { num: '03', title: 'Train every day', desc: 'Replay sessions on demand. Build your library. Track what you\'ve learned.' },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#18180f] border-t border-[#322f26]">
      <div className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-[#b3402f]" />
            <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">Simple process</p>
          </div>
          <h2 className="font-mincho font-normal text-4xl lg:text-5xl text-[#f0eadc] tracking-[.5px] leading-tight">How it works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#322f26]">
          {STEPS.map(({ num, title, desc }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, ease: 'easeOut', delay: i * 0.06 }}
              className="bg-[#18180f] p-8"
            >
              <div className="font-mincho font-semibold text-7xl text-[#942f22]/35 tracking-[.5px] leading-none mb-6">{num}</div>
              <h3 className="font-mincho font-normal text-2xl text-[#f0eadc] tracking-[.5px] leading-none mb-4">{title}</h3>
              <p className="font-mincho text-sm text-[#7a7568] leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const PRICING_FEATURES = [
  'Full access to live classes & replays',
  'AI session summaries & technique breakdowns',
  'Works on mobile and desktop',
  'Cancel anytime',
]

function Pricing() {
  return (
    <section id="pricing" className="bg-[#141410] border-t border-[#322f26]">
      <div className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-[#b3402f]" />
            <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">Simple pricing</p>
          </div>
          <h2 className="font-mincho font-normal text-4xl lg:text-5xl text-[#f0eadc] tracking-[.5px] leading-tight">Pay your gym.<br />Train online.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#322f26] max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="p-8 bg-[#1c1c16]"
          >
            <p className="font-mincho text-[11px] text-[#7a7568] tracking-[4px] uppercase mb-5">Per Gym Membership</p>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="font-mincho font-normal text-4xl text-[#f0eadc] tracking-[.5px] leading-none">Gym sets price</span>
            </div>
            <p className="font-mincho text-sm text-[#7a7568] mb-8 leading-relaxed">
              Each gym sets their own monthly price. You pay directly for access to that gym's live classes and replays.
            </p>
            <div className="border-t border-[#2a2a20] pt-6 mb-8 space-y-3">
              {PRICING_FEATURES.map(f => (
                <div key={f} className="flex items-start gap-3">
                  <div className="w-1 h-1 bg-[#7a7568] mt-2 shrink-0" />
                  <p className="font-mincho text-sm text-[#a29c8c]">{f}</p>
                </div>
              ))}
            </div>
            <a href="/gyms" className="block font-mincho text-sm tracking-[2px] text-center py-4 rounded-sm transition-all duration-150 bg-[#f0eadc] text-[#141410] hover:bg-[#e4dcc8]">
              Browse Gyms
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2, ease: 'easeOut', delay: 0.05 }}
            className="p-8 bg-[#141410] flex flex-col justify-center"
          >
            <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase mb-6">How It Works</p>
            {[
              { n: '01', text: 'Browse gyms and pick one you like' },
              { n: '02', text: 'Pay their monthly membership fee securely online' },
              { n: '03', text: 'Watch every live class and replay' },
            ].map(item => (
              <div key={item.n} className="flex items-start gap-4 mb-6 last:mb-0">
                <span className="font-mincho text-2xl text-[#b3402f]/40 leading-none shrink-0">{item.n}</span>
                <p className="font-mincho text-sm text-[#a29c8c] leading-relaxed">{item.text}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function CTABanner() {
  return (
    <section className="bg-[#18180f] border-t border-[#322f26]">
      <div className="max-w-[1280px] mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-px bg-[#b3402f]" />
            <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">Ready?</p>
          </div>
          <h2 className="font-mincho font-normal text-[#f0eadc] leading-[1.1] tracking-[.5px] mb-10 border-l-2 border-[#b3402f] pl-6" style={{ fontSize: 'clamp(36px, 5vw, 60px)' }}>
            Train with the best.<br />From anywhere.
          </h2>
          <a href="/signup" className="inline-flex items-center gap-2 font-mincho text-sm tracking-[2px] bg-[#f0eadc] text-[#141410] px-10 py-4 rounded-sm hover:bg-[#e4dcc8] transition-all duration-150">
            Join MATPEAK <ArrowRight size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

const DISCIPLINES_LIST = ['BJJ', 'Boxing', 'Muay Thai', 'Wrestling', 'MMA', 'Kickboxing', 'Judo', 'Sambo']

function GymWaitlist() {
  const [form, setForm] = useState({ name: '', gym_name: '', discipline: '', city: '', contact: '', website: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function set(field: string, val: string) { setForm(p => ({ ...p, [field]: val })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/gym/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.status === 409) { setStatus('duplicate'); return }
      if (!res.ok) {
        const d = await res.json()
        setErrorMsg(d.error ?? 'Something went wrong')
        setStatus('error')
        return
      }
      setStatus('success')
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  const inputCls = 'w-full bg-[#141410] border border-[#322f26] rounded-sm px-4 py-3 text-[#f0eadc] placeholder-[#635f54] text-sm font-mincho focus:outline-none focus:border-[#f0eadc]/40 transition-colors'

  return (
    <section className="bg-[#141410] border-t border-[#322f26]">
      <div className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-px bg-[#b3402f]" />
              <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">For Gym Owners</p>
            </div>
            <h2 className="font-mincho font-normal text-[#f0eadc] leading-[1.1] tracking-[.5px] mb-6" style={{ fontSize: 'clamp(30px, 4vw, 46px)' }}>
              Stream your gym.<br />Reach the world.
            </h2>
            <p className="font-mincho text-[#a29c8c] text-sm leading-relaxed mb-8 max-w-md">
              Partner with MATPEAK to broadcast your classes live, build a global subscriber base, and earn while your students train — wherever they are.
            </p>
            <div className="space-y-3">
              {[
                'Go live in minutes from any device',
                'Members pay monthly — you keep 70%',
                'Auto-generated preview clips for Instagram',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-1 h-1 bg-[#b3402f] rounded-full shrink-0" />
                  <p className="font-mincho text-sm text-[#a29c8c]">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.2, ease: 'easeOut', delay: 0.05 }}
          >
            {status === 'success' ? (
              <div className="relative bg-[#1c1c16] border border-[#322f26] rounded-sm px-6 py-12 text-center overflow-hidden">
                <span className="absolute inset-0 flex items-center justify-center font-mincho text-[110px] text-[#f0eadc]/[0.03] leading-none select-none pointer-events-none">Done</span>
                <p className="relative font-mincho font-normal text-3xl text-[#f0eadc] tracking-[.5px] mb-2">You're on the list</p>
                <p className="relative font-mincho text-[#a29c8c] text-sm">We'll reach out when we're ready to onboard your gym.</p>
              </div>
            ) : status === 'duplicate' ? (
              <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm px-6 py-12 text-center">
                <p className="font-mincho font-normal text-2xl text-[#f0eadc] tracking-[.5px] mb-2">Already on the list</p>
                <p className="font-mincho text-[#a29c8c] text-sm">We already have your details. We'll be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-6 space-y-4">
                <h3 className="font-mincho font-normal text-xl text-[#f0eadc] tracking-[.5px]">Apply to become a partner</h3>
                {/* Honeypot */}
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={e => set('website', e.target.value)}
                  tabIndex={-1}
                  style={{ display: 'none' }}
                  aria-hidden="true"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase block mb-1.5">Your Name</label>
                    <input className={inputCls} required value={form.name} onChange={e => set('name', e.target.value)} />
                  </div>
                  <div>
                    <label className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase block mb-1.5">Gym Name</label>
                    <input className={inputCls} required value={form.gym_name} onChange={e => set('gym_name', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase block mb-1.5">Primary Discipline</label>
                    <select className={`${inputCls} cursor-pointer`} required value={form.discipline} onChange={e => set('discipline', e.target.value)}>
                      <option value="">Select…</option>
                      {DISCIPLINES_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase block mb-1.5">City</label>
                    <input className={inputCls} required value={form.city} onChange={e => set('city', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase block mb-1.5">Phone or Email</label>
                  <input className={inputCls} required value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="+91 98765 43210 or you@gym.com" />
                </div>
                {status === 'error' && (
                  <p className="font-mincho text-[#b3402f] text-xs">{errorMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-[#b3402f] hover:bg-[#c25040] disabled:opacity-50 text-[#f0eadc] font-mincho tracking-[2px] py-3.5 rounded-sm text-sm transition-colors"
                >
                  {status === 'loading' ? 'Submitting…' : 'Join the Waitlist'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-[#141410] border-t border-[#322f26]">
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <span className="font-mincho text-xl tracking-[1px] text-[#f0eadc]">MAT<span className="text-[#b3402f]">PEAK</span></span>
            <p className="font-mincho text-xs text-[#635f54] mt-2">Combat sports live training platform.</p>
          </div>
          <div className="flex flex-wrap gap-8">
            {['Gyms', 'Coaches', 'Disciplines', 'Pricing', 'Login', 'Sign up'].map(l => (
              <a key={l} href="#" className="font-mincho text-xs text-[#635f54] hover:text-[#f0eadc] transition-colors duration-150">{l}</a>
            ))}
          </div>
        </div>
        <div className="border-t border-[#2a2a20] mt-12 pt-8">
          <p className="font-mincho text-[11px] text-[#635f54]">© 2026 MATPEAK. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <main className="bg-[#141410] min-h-screen">
      <Navbar />
      <Hero />
      <Disciplines />
      <HowItWorks />
      <Pricing />
      <CTABanner />
      <GymWaitlist />
      <Footer />
    </main>
  )
}
