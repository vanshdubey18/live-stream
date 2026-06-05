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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? 'bg-[#0D0D0D] border-b border-[#333333]' : 'bg-transparent'}`}>
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="font-bebas text-2xl tracking-[2px] text-white">MATPEAK</a>
        <div className="hidden md:flex items-center gap-8">
          {['#disciplines', '#how-it-works', '#pricing'].map((href, i) => (
            <a key={href} href={href} className="font-inter text-sm text-[#555555] hover:text-white transition-colors duration-150">
              {['Disciplines', 'How it works', 'Pricing'][i]}
            </a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <a href="/login" className="font-inter text-sm text-[#555555] hover:text-white transition-colors duration-150 px-4 py-2">Log in</a>
          <a href="/signup" className="font-bebas text-sm tracking-[3px] bg-white text-black px-6 py-2.5 rounded-sm hover:bg-[#E5E5E5] transition-all duration-150">START TRAINING</a>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden text-[#999999] hover:text-white">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-[#0D0D0D] border-t border-[#333333] px-6 py-6 flex flex-col gap-5">
          {[['#disciplines','Disciplines'],['#how-it-works','How it works'],['#pricing','Pricing']].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="font-inter text-sm text-[#555555] hover:text-white transition-colors">{label}</a>
          ))}
          <div className="border-t border-[#333333] pt-5 flex flex-col gap-3">
            <a href="/login" className="font-inter text-sm text-[#555555] hover:text-white">Log in</a>
            <a href="/signup" className="font-bebas text-sm tracking-[3px] bg-white text-black px-6 py-3 rounded-sm text-center hover:bg-[#E5E5E5] transition-all">START TRAINING</a>
          </div>
        </div>
      )}
    </nav>
  )
}

function Hero() {
  return (
    <section className="relative min-h-screen bg-[#0D0D0D] flex flex-col justify-between pt-16 overflow-hidden">

      {/* Full-bleed athlete photo */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/10006587/pexels-photo-10006587.jpeg?auto=compress&cs=tinysrgb&w=1600&h=1200&fit=crop"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center grayscale contrast-110 brightness-110"
        />
        {/* Subtle base dim — keep photo readable */}
        <div className="absolute inset-0 bg-black/30" />
        {/* Left gradient — text zone dark, athlete visible on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/30 to-transparent" />
        {/* Bottom fade into stat bar */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/20 to-transparent" style={{ top: '65%' }} />
        {/* Top fade into navbar */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D]/50 via-transparent to-transparent" style={{ bottom: '88%' }} />
        {/* Warm red tint — brand feel */}
        <div className="absolute inset-0 bg-[#FF3B3B]/5 mix-blend-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-[1280px] mx-auto px-6 w-full py-24 lg:py-36">
          <div className="max-w-[620px]">

            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-6 h-px bg-[#FF3B3B]" />
              <p className="font-inter text-[11px] text-[#FF3B3B] tracking-[4px] uppercase">
                Combat Sports &bull; Live Training
              </p>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }}
              className="font-bebas uppercase leading-[0.88] tracking-[1px]"
              style={{ fontSize: 'clamp(68px, 9vw, 120px)' }}
            >
              <span className="block text-white">WORLD-CLASS</span>
              <span className="block text-white">TRAINING.</span>
              <span className="block text-[#FF3B3B]">WHEREVER YOU ARE.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut', delay: 0.12 }}
              className="font-inter text-[#AAAAAA] text-base mt-8 max-w-[400px] leading-relaxed"
            >
              Stream live classes from real MMA gyms.<br />
              BJJ. Boxing. Muay Thai. Wrestling.<br />
              Train from anywhere in the world.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut', delay: 0.18 }}
              className="flex flex-wrap items-center gap-3 mt-10"
            >
              <a href="/signup" className="font-bebas text-sm tracking-[3px] bg-white text-black px-8 py-4 rounded-sm hover:bg-[#E5E5E5] transition-all duration-150 flex items-center gap-2">
                START TRAINING <ArrowRight size={14} />
              </a>
              <a href="/gyms" className="font-inter text-sm text-[#AAAAAA] border border-white/20 px-8 py-[14px] rounded-sm hover:text-white hover:border-white/40 transition-all duration-150">
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
        className="relative z-10 max-w-[1280px] mx-auto px-6 pb-6"
      >
        <span className="font-inter text-[9px] text-[#FF3B3B] tracking-[3px] uppercase border border-[#FF3B3B]/30 bg-black/40 px-2.5 py-1.5 rounded-sm backdrop-blur-sm">
          Train at the source
        </span>
      </motion.div>

      {/* Stat bar */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.25, delay: 0.2, ease: 'easeOut' }}
        className="relative z-10 border-t border-[#333333]"
      >
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-3 divide-x divide-[#333333]">
            {[
              { value: 2400, suffix: '+', label: 'HOURS STREAMED' },
              { value: 47, suffix: '', label: 'COACHES' },
              { value: 4, suffix: '', label: 'DISCIPLINES' },
            ].map(({ value, suffix, label }) => (
              <div key={label} className="px-6 lg:px-10 py-8 first:pl-0">
                <div className="font-bebas text-5xl lg:text-6xl text-white tracking-[1px] leading-none">
                  <StatCounter end={value} suffix={suffix} />
                </div>
                <p className="font-inter text-[11px] text-[#555555] tracking-[4px] uppercase mt-2">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}

const DISCIPLINES = [
  { name: 'BJJ', full: 'Brazilian Jiu-Jitsu', desc: 'Ground control, submissions, guard play. The chess match of combat sports.', count: '12 gyms' },
  { name: 'BOXING', full: 'Boxing', desc: 'Footwork, combinations, head movement. The sweet science.', count: '8 gyms' },
  { name: 'MUAY THAI', full: 'Muay Thai', desc: 'Eight limbs. Elbows, knees, clinch. The art of eight weapons.', count: '9 gyms' },
  { name: 'WRESTLING', full: 'Wrestling', desc: 'Takedowns, scrambles, top pressure. The foundation of MMA.', count: '5 gyms' },
]

function Disciplines() {
  return (
    <section id="disciplines" className="bg-[#0D0D0D] border-t border-[#333333]">
      <div className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-[#FF3B3B]" />
            <p className="font-inter text-[11px] text-[#FF3B3B] tracking-[4px] uppercase">What we stream</p>
          </div>
          <h2 className="font-bebas text-5xl lg:text-6xl text-white tracking-[1px] leading-none">FOUR DISCIPLINES.<br />ONE PLATFORM.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#333333]">
          {DISCIPLINES.map(({ name, full, desc, count }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, ease: 'easeOut', delay: i * 0.04 }}
              whileHover={{ y: -2 }}
              className="bg-[#0D0D0D] p-8 group cursor-pointer hover:bg-[#111111] transition-colors duration-150 border-t-2 border-transparent hover:border-[#FF3B3B]"
            >
              <span className="font-inter text-[10px] text-[#666666] tracking-[3px] uppercase border border-[#333333] px-2 py-0.5 rounded-sm">{count}</span>
              <h3 className="font-bebas text-4xl text-white tracking-[1px] leading-none mt-5 mb-2 group-hover:text-[#FF3B3B] transition-colors duration-150">{name}</h3>
              <p className="font-inter text-xs text-[#666666] mb-1">{full}</p>
              <p className="font-inter text-sm text-[#666666] leading-relaxed mt-2">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const STEPS = [
  { num: '01', title: 'FIND YOUR GYM', desc: 'Browse verified gyms by discipline, city, or coach. Every gym is vetted.' },
  { num: '02', title: 'JOIN THE STREAM', desc: 'Subscribe to a gym. Watch live classes in real-time from anywhere.' },
  { num: '03', title: 'TRAIN EVERY DAY', desc: 'Replay sessions on demand. Build your library. Track what you\'ve learned.' },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#111111] border-t border-[#333333]">
      <div className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-[#FF3B3B]" />
            <p className="font-inter text-[11px] text-[#FF3B3B] tracking-[4px] uppercase">Simple process</p>
          </div>
          <h2 className="font-bebas text-5xl lg:text-6xl text-white tracking-[1px] leading-none">HOW IT WORKS</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#333333]">
          {STEPS.map(({ num, title, desc }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, ease: 'easeOut', delay: i * 0.06 }}
              className="bg-[#111111] p-8"
            >
              <div className="font-bebas text-7xl text-[#FF3B3B]/15 tracking-[1px] leading-none mb-6">{num}</div>
              <h3 className="font-bebas text-2xl text-white tracking-[1px] leading-none mb-4">{title}</h3>
              <p className="font-inter text-sm text-[#666666] leading-relaxed">{desc}</p>
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
    <section id="pricing" className="bg-[#0D0D0D] border-t border-[#333333]">
      <div className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-[#FF3B3B]" />
            <p className="font-inter text-[11px] text-[#FF3B3B] tracking-[4px] uppercase">Simple pricing</p>
          </div>
          <h2 className="font-bebas text-5xl lg:text-6xl text-white tracking-[1px] leading-none">PAY YOUR GYM.<br />TRAIN ONLINE.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#333333] max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="p-8 bg-[#1A1A1A]"
          >
            <p className="font-inter text-[11px] text-[#555555] tracking-[4px] uppercase mb-5">Per Gym Membership</p>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="font-bebas text-6xl text-white tracking-[1px] leading-none">GYM SETS PRICE</span>
            </div>
            <p className="font-inter text-sm text-[#555555] mb-8 leading-relaxed">
              Each gym sets their own monthly price. You pay directly for access to that gym's live classes and replays.
            </p>
            <div className="border-t border-[#2A2A2A] pt-6 mb-8 space-y-3">
              {PRICING_FEATURES.map(f => (
                <div key={f} className="flex items-start gap-3">
                  <div className="w-1 h-1 bg-[#555555] mt-2 shrink-0" />
                  <p className="font-inter text-sm text-[#999999]">{f}</p>
                </div>
              ))}
            </div>
            <a href="/gyms" className="block font-bebas text-sm tracking-[3px] text-center py-4 rounded-sm transition-all duration-150 bg-white text-black hover:bg-[#E5E5E5]">
              BROWSE GYMS
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2, ease: 'easeOut', delay: 0.05 }}
            className="p-8 bg-[#0D0D0D] flex flex-col justify-center"
          >
            <p className="font-inter text-[11px] text-[#FF3B3B] tracking-[4px] uppercase mb-6">How It Works</p>
            {[
              { n: '01', text: 'Browse gyms and pick one you like' },
              { n: '02', text: 'Pay their monthly fee with a coupon code' },
              { n: '03', text: 'Watch every live class and replay' },
            ].map(item => (
              <div key={item.n} className="flex items-start gap-4 mb-6 last:mb-0">
                <span className="font-bebas text-2xl text-[#FF3B3B]/40 leading-none shrink-0">{item.n}</span>
                <p className="font-inter text-sm text-[#999999] leading-relaxed">{item.text}</p>
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
    <section className="bg-[#111111] border-t border-[#333333]">
      <div className="max-w-[1280px] mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-px bg-[#FF3B3B]" />
            <p className="font-inter text-[11px] text-[#FF3B3B] tracking-[4px] uppercase">Ready?</p>
          </div>
          <h2 className="font-bebas text-white leading-[0.88] tracking-[1px] mb-10 border-l-2 border-[#FF3B3B] pl-6" style={{ fontSize: 'clamp(48px, 7vw, 80px)' }}>
            THE MAT DOESN&apos;T CARE<br />WHERE YOU&apos;RE FROM.
          </h2>
          <a href="/signup" className="inline-flex items-center gap-2 font-bebas text-sm tracking-[3px] bg-white text-black px-10 py-4 rounded-sm hover:bg-[#E5E5E5] transition-all duration-150">
            JOIN MATPEAK <ArrowRight size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-[#0D0D0D] border-t border-[#333333]">
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <span className="font-bebas text-xl tracking-[2px] text-white">MATPEAK</span>
            <p className="font-inter text-xs text-[#444444] mt-2">Combat sports live training platform.</p>
          </div>
          <div className="flex flex-wrap gap-8">
            {['Gyms', 'Coaches', 'Disciplines', 'Pricing', 'Login', 'Sign up'].map(l => (
              <a key={l} href="#" className="font-inter text-xs text-[#444444] hover:text-white transition-colors duration-150">{l}</a>
            ))}
          </div>
        </div>
        <div className="border-t border-[#222222] mt-12 pt-8">
          <p className="font-inter text-[11px] text-[#444444]">© 2026 MATPEAK. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <main className="bg-[#0D0D0D] min-h-screen">
      <Navbar />
      <Hero />
      <Disciplines />
      <HowItWorks />
      <Pricing />
      <CTABanner />
      <Footer />
    </main>
  )
}
