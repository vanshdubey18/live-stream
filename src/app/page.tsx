'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Menu,
  X,
  ArrowRight,
  Play,
  Users,
  Globe,
  Dumbbell,
  Target,
  Zap,
  Shield,
  TrendingUp,
  Video,
  CheckCircle,
  ChevronRight,
} from 'lucide-react'

// ─── Scroll animation hook ───────────────────────────────────────────────────
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'Gyms', href: '#disciplines' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <a href="#" className="text-2xl font-black tracking-tighter text-[#DC2626] select-none">
            MATPEAK
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[#888888] hover:text-white text-sm font-medium transition-colors duration-200"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/gym-signup"
              className="px-4 py-2 text-sm font-semibold text-white border border-white/20 rounded-lg hover:border-white/50 hover:bg-white/5 transition-all duration-200"
            >
              List Your Gym
            </a>
            <a
              href="/signup"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#DC2626] rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-1.5"
            >
              Start Training <ArrowRight size={14} />
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        } bg-[#0a0a0a]/98 backdrop-blur-md border-b border-white/5`}
      >
        <div className="px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-[#888888] hover:text-white text-base font-medium transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
            <a
              href="/gym-signup"
              className="w-full text-center py-2.5 text-sm font-semibold text-white border border-white/20 rounded-lg hover:border-white/50 transition-all"
            >
              List Your Gym
            </a>
            <a
              href="/signup"
              className="w-full text-center py-2.5 text-sm font-semibold text-white bg-[#DC2626] rounded-lg hover:bg-red-700 transition-all"
            >
              Start Training →
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const [videoError, setVideoError] = useState(false)

  return (
    <section className="relative min-h-screen flex flex-col justify-center bg-black overflow-hidden">
      {/* Animated gradient overlay behind everything */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 40%, #0d0505 70%, #0a0a0a 100%)',
          animation: 'gradientShift 8s ease-in-out infinite alternate',
        }}
      />

      {/* Subtle animated red glow pulse */}
      <div
        className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-[#DC2626]/8 rounded-full blur-[140px] pointer-events-none"
        style={{ animation: 'pulseGlow 6s ease-in-out infinite alternate' }}
      />
      <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-[#DC2626]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-[#DC2626]/10 border border-[#DC2626]/30 rounded-full px-4 py-1.5 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" />
          <span className="text-[#DC2626] text-xs font-semibold tracking-wide uppercase">
            Live classes streaming now
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-none mb-4"
        >
          <span className="text-white block">World-class training.</span>
          <span className="text-[#DC2626] block">Wherever you are.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[#888888] text-lg sm:text-xl max-w-xl mt-6 mb-10 leading-relaxed"
        >
          Stream live classes from real MMA gyms.{' '}
          <span className="text-white/70">BJJ. Boxing. Muay Thai. Wrestling.</span>{' '}
          Join as a member of any gym worldwide.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-14"
        >
          <a
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl text-base transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-900/30"
          >
            Start Training <ArrowRight size={18} />
          </a>
          <a
            href="#disciplines"
            className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/50 hover:bg-white/5 text-white font-bold px-8 py-4 rounded-xl text-base transition-all duration-200"
          >
            <Play size={16} className="fill-white" /> Browse Gyms
          </a>
        </motion.div>

        {/* ── Mock Video Player ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="relative w-full max-w-3xl mx-auto"
          style={{ aspectRatio: '16/9' }}
        >
          {/* Outer glow ring */}
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-[#DC2626]/30 via-white/5 to-transparent pointer-events-none z-10" />

          {/* Video element — 404s gracefully, triggers onError */}
          {!videoError && (
            <video
              autoPlay
              muted
              loop
              playsInline
              onError={() => setVideoError(true)}
              className="absolute inset-0 w-full h-full object-cover rounded-2xl"
              src="/placeholder-video.mp4"
            />
          )}

          {/* Styled placeholder — shown when video fails or as base layer */}
          <div className="absolute inset-0 bg-[#111] rounded-2xl border border-white/10 overflow-hidden flex flex-col items-center justify-center gap-4">
            {/* Red gradient tint overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#DC2626]/15 via-transparent to-[#DC2626]/5 pointer-events-none" />

            {/* Pulsing play icon */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-24 h-24 rounded-full bg-[#DC2626]/20 animate-ping" />
              <div className="relative w-16 h-16 rounded-full bg-[#DC2626] flex items-center justify-center shadow-xl shadow-red-900/50">
                <Play size={28} className="fill-white text-white ml-1" />
              </div>
            </div>

            <p className="relative text-white/80 text-sm sm:text-base font-medium tracking-wide text-center px-4">
              Watch real classes from real gyms
            </p>

            {/* Fake playback bar */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1.5">
              <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#DC2626] rounded-full"
                  style={{ width: '38%', animation: 'progressBar 12s linear infinite' }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/30 text-[10px] font-mono">0:47</span>
                <span className="text-white/30 text-[10px] font-mono">2:03</span>
              </div>
            </div>

            {/* Live badge */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-[#DC2626] rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white text-[10px] font-bold tracking-widest uppercase">Live</span>
            </div>
          </div>
        </motion.div>

        {/* Bottom fade into page bg */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />

        {/* Stats */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 mt-12 pt-10 border-t border-white/5 relative z-10">
          {[
            { value: '50+', label: 'Coaches' },
            { value: '4', label: 'Disciplines' },
            { value: 'Train', label: 'Anywhere' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <span className="text-3xl font-black text-white">{stat.value}</span>
              <span className="text-[#888888] text-sm font-medium leading-tight">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        @keyframes pulseGlow {
          0%   { opacity: 0.5; transform: scale(0.95); }
          100% { opacity: 1;   transform: scale(1.05); }
        }
        @keyframes progressBar {
          0%   { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </section>
  )
}

// ─── Starting Soon ─────────────────────────────────────────────────────────────
const UPCOMING = [
  {
    title: 'Boxing Fundamentals',
    gym: 'Strike Lab Boxing',
    coach: 'Coach Arjun',
    discipline: 'Boxing',
    startsIn: 23,
    level: 'Beginner',
  },
  {
    title: 'Advanced Guard Passing',
    gym: 'Xtreme MMA Mumbai',
    coach: 'Coach Rajan',
    discipline: 'BJJ',
    startsIn: 47,
    level: 'Advanced',
  },
  {
    title: 'Muay Thai Clinch Work',
    gym: 'Xtreme MMA Mumbai',
    coach: 'Coach Siddhi',
    discipline: 'Muay Thai',
    startsIn: 91,
    level: 'Intermediate',
  },
]

const DISCIPLINE_COLORS: Record<string, string> = {
  Boxing: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  BJJ: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  'Muay Thai': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  Wrestling: 'bg-green-500/15 text-green-400 border-green-500/25',
}

const LEVEL_COLORS: Record<string, string> = {
  Beginner: 'bg-emerald-500/10 text-emerald-400',
  Intermediate: 'bg-yellow-500/10 text-yellow-400',
  Advanced: 'bg-red-500/10 text-red-400',
}

function StartingSoon() {
  return (
    <section className="bg-[#0a0a0a] border-t border-b border-white/5 py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
          className="mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ⚡ Starting Soon
          </h2>
          <p className="text-[#888888] text-sm mt-1.5">
            Live classes you can join right now
          </p>
        </motion.div>

        {/* Cards — horizontal scroll on mobile */}
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:overflow-visible snap-x snap-mandatory sm:snap-none">
          {UPCOMING.map((cls, i) => (
            <motion.div
              key={cls.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="flex-shrink-0 w-72 sm:w-auto snap-start bg-[#111] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 hover:border-white/10 transition-all duration-300"
            >
              {/* Top row: discipline pill + level badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border tracking-wide ${
                    DISCIPLINE_COLORS[cls.discipline] ?? 'bg-white/10 text-white border-white/10'
                  }`}
                >
                  {cls.discipline}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    LEVEL_COLORS[cls.level] ?? 'bg-white/10 text-white'
                  }`}
                >
                  {cls.level}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-white font-bold text-base leading-snug">{cls.title}</h3>

              {/* Gym + Coach */}
              <div className="flex flex-col gap-1">
                <span className="text-[#888888] text-xs">{cls.gym}</span>
                <span className="text-[#666] text-xs">{cls.coach}</span>
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse shrink-0" />
                <span className="text-[#DC2626] text-sm font-bold">
                  Starts in {cls.startsIn}m
                </span>
              </div>

              {/* CTA */}
              <a
                href="/signup"
                className="mt-auto w-full text-center py-2.5 rounded-xl text-sm font-bold text-white border border-white/10 hover:border-[#DC2626]/40 hover:bg-[#DC2626]/10 transition-all duration-200"
              >
                Try Free →
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const { ref, visible } = useFadeIn()

  const steps = [
    {
      number: '01',
      icon: <Target size={24} className="text-[#DC2626]" />,
      title: 'Find Your Gym',
      desc: 'Browse gyms by discipline and location. Read reviews, watch previews, and pick your perfect training home.',
    },
    {
      number: '02',
      icon: <Shield size={24} className="text-[#DC2626]" />,
      title: 'Become a Member',
      desc: 'Join with a gym discount code or subscribe directly. Instant access, no contracts, cancel anytime.',
    },
    {
      number: '03',
      icon: <Zap size={24} className="text-[#DC2626]" />,
      title: 'Train Daily',
      desc: 'Watch live classes and replays anytime from any device. Train at full intensity on your own schedule.',
    },
  ]

  return (
    <section id="how-it-works" className="bg-[#0a0a0a] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section label */}
        <div className="text-center mb-16">
          <span className="text-[#DC2626] text-xs font-bold tracking-widest uppercase">
            How it works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-3 tracking-tight">
            Three steps to the mat
          </h2>
        </div>

        <div
          ref={ref}
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="bg-[#111111] border border-white/5 rounded-2xl p-8 hover:border-[#DC2626]/30 transition-all duration-300 group"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-[#DC2626]/10 rounded-xl flex items-center justify-center group-hover:bg-[#DC2626]/20 transition-colors">
                  {step.icon}
                </div>
                <span className="text-5xl font-black text-white/5 group-hover:text-white/10 transition-colors">
                  {step.number}
                </span>
              </div>
              <h3 className="text-white text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-[#888888] text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Disciplines ──────────────────────────────────────────────────────────────
function Disciplines() {
  const { ref, visible } = useFadeIn()

  const disciplines = [
    {
      icon: <Shield size={28} className="text-[#DC2626]" />,
      name: 'BJJ',
      full: 'Brazilian Jiu-Jitsu',
      desc: 'Ground fighting, submissions, and grappling from world-class instructors.',
    },
    {
      icon: <Target size={28} className="text-[#DC2626]" />,
      name: 'Boxing',
      full: 'Boxing',
      desc: 'Striking technique, footwork, and fight IQ from professional boxing coaches.',
    },
    {
      icon: <Zap size={28} className="text-[#DC2626]" />,
      name: 'Muay Thai',
      full: 'Muay Thai',
      desc: 'Eight-limb striking art — punches, kicks, elbows, and knees.',
    },
    {
      icon: <Dumbbell size={28} className="text-[#DC2626]" />,
      name: 'Wrestling',
      full: 'Wrestling',
      desc: 'Takedowns, chain wrestling, and top control for the complete MMA game.',
    },
  ]

  return (
    <section id="disciplines" className="bg-[#0a0a0a] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#DC2626] text-xs font-bold tracking-widest uppercase">
            Disciplines
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-3 tracking-tight">
            Every path to the cage
          </h2>
        </div>

        <div
          ref={ref}
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {disciplines.map((d, i) => (
            <div
              key={d.name}
              className="bg-[#111111] border border-white/5 rounded-2xl p-7 hover:border-[#DC2626]/40 hover:bg-[#111111]/80 transition-all duration-300 group cursor-pointer"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="w-14 h-14 bg-[#DC2626]/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#DC2626]/20 transition-colors">
                {d.icon}
              </div>
              <div className="text-[#DC2626] text-xs font-bold tracking-widest uppercase mb-1">
                {d.name}
              </div>
              <h3 className="text-white text-lg font-bold mb-3">{d.full}</h3>
              <p className="text-[#888888] text-sm leading-relaxed">{d.desc}</p>
              <div className="mt-5 flex items-center gap-1 text-[#DC2626] text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Browse gyms <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
function Pricing() {
  const { ref, visible } = useFadeIn()

  const plans = [
    {
      name: 'Single Discipline',
      price: '999',
      period: '/month',
      popular: false,
      features: [
        'One discipline, unlimited classes',
        'Live sessions + full replays',
        'Progress tracking',
        'Community access',
      ],
    },
    {
      name: 'Dual Discipline',
      price: '1,499',
      period: '/month',
      popular: true,
      features: [
        'Any two disciplines',
        'Live sessions + full replays',
        'Progress tracking',
        'Priority support',
        'Early access to new gyms',
      ],
    },
    {
      name: 'Full MMA Access',
      price: '1,999',
      period: '/month',
      popular: false,
      features: [
        'All disciplines, unlimited everything',
        'Live sessions + full replays',
        'Advanced analytics',
        'AI session summaries',
        'Dedicated coach Q&A',
      ],
    },
  ]

  return (
    <section id="pricing" className="bg-[#0a0a0a] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4">
          <span className="text-[#DC2626] text-xs font-bold tracking-widest uppercase">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-3 tracking-tight">
            Simple membership pricing
          </h2>
          <p className="text-[#888888] mt-3 text-base">Per gym. Cancel anytime.</p>
        </div>

        <div
          ref={ref}
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col transition-all duration-300 ${
                plan.popular
                  ? 'bg-[#111111] border-2 border-[#DC2626] shadow-xl shadow-red-900/20'
                  : 'bg-[#111111] border border-white/5 hover:border-white/10'
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-[#DC2626] text-white text-xs font-bold px-4 py-1 rounded-full tracking-wide">
                    POPULAR
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-white font-bold text-lg mb-4">{plan.name}</h3>
                <div className="flex items-end gap-1">
                  <span className="text-[#888888] text-xl font-bold">₹</span>
                  <span className="text-white text-5xl font-black tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-[#888888] text-sm mb-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle
                      size={16}
                      className={`mt-0.5 shrink-0 ${plan.popular ? 'text-[#DC2626]' : 'text-white/30'}`}
                    />
                    <span className="text-[#888888] text-sm">{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="/signup"
                className={`w-full text-center py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  plan.popular
                    ? 'bg-[#DC2626] text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-900/30'
                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                Get Started
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── For Gyms ─────────────────────────────────────────────────────────────────
function ForGyms() {
  const { ref, visible } = useFadeIn()

  const stats = [
    { label: 'Members', value: '234', icon: <Users size={16} className="text-[#DC2626]" /> },
    { label: 'Monthly Revenue', value: '₹2,34,000', icon: <TrendingUp size={16} className="text-[#DC2626]" /> },
    { label: 'Classes Streamed', value: '47', icon: <Video size={16} className="text-[#DC2626]" /> },
    { label: 'Countries Reached', value: '12', icon: <Globe size={16} className="text-[#DC2626]" /> },
  ]

  return (
    <section id="for-gyms" className="bg-[#0a0a0a] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div
          ref={ref}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Left: Text */}
          <div>
            <span className="text-[#DC2626] text-xs font-bold tracking-widest uppercase">
              For Gyms
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-3 mb-6 tracking-tight leading-tight">
              Stream your classes globally
            </h2>
            <div className="space-y-4 mb-10">
              {[
                'Reach members worldwide with zero infrastructure.',
                'Keep 70% of every membership — we handle the rest.',
                'We manage payments, replays, and AI session summaries.',
              ].map((line) => (
                <div key={line} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#DC2626] mt-2 shrink-0" />
                  <p className="text-[#888888] text-base leading-relaxed">{line}</p>
                </div>
              ))}
            </div>
            <a
              href="/gym-signup"
              className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-900/30"
            >
              List Your Gym <ArrowRight size={16} />
            </a>
          </div>

          {/* Right: Gym stats card */}
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6 pb-5 border-b border-white/5">
              <div>
                <div className="text-white font-bold text-lg">Iron Temple MMA</div>
                <div className="text-[#888888] text-sm">Mumbai, India</div>
              </div>
              <div className="w-10 h-10 bg-[#DC2626]/20 rounded-xl flex items-center justify-center">
                <Shield size={18} className="text-[#DC2626]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[#0a0a0a] rounded-xl p-5 border border-white/5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {stat.icon}
                    <span className="text-[#888888] text-xs font-medium">{stat.label}</span>
                  </div>
                  <div className="text-white font-black text-xl tracking-tight">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between bg-[#DC2626]/10 border border-[#DC2626]/20 rounded-xl px-5 py-3.5">
              <span className="text-[#DC2626] text-sm font-semibold">Revenue this month</span>
              <span className="text-white font-black">+18%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const footerLinks = [
    { label: 'About', href: '#' },
    { label: 'Gyms', href: '#disciplines' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'For Gyms', href: '#for-gyms' },
    { label: 'Contact', href: 'mailto:hello@matpeak.com' },
  ]

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="text-2xl font-black tracking-tighter text-[#DC2626] mb-1">
              MATPEAK
            </div>
            <p className="text-[#888888] text-sm">
              World-class combat sports training, anywhere.
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {footerLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[#888888] hover:text-white text-sm transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[#888888] text-xs">
            © 2026 Matpeak. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <StartingSoon />
      <HowItWorks />
      <Disciplines />
      <Pricing />
      <ForGyms />
      <Footer />
    </>
  )
}
