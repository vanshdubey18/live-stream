'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import SearchResult, { SearchResultItem } from './SearchResult'

// ─── Static data ──────────────────────────────────────────────────────────────
const TECHNIQUES = [
  { title: 'Half guard sweep', sessions: 8, example: "28:20 in Coach Rahul's BJJ class" },
  { title: 'Rear naked choke finish', sessions: 5, example: "12:44 in Coach Rajan's Advanced BJJ" },
  { title: 'Jab-cross-hook combo', sessions: 12, example: "08:15 in Coach Arjun's Boxing Fundamentals" },
  { title: 'Teep kick defense', sessions: 6, example: '19:30 in Muay Thai Clinch Work' },
  { title: 'Single leg takedown', sessions: 4, example: '35:10 in Wrestling Basics' },
]

const COACHES = [
  { name: 'Coach Rajan', gym: 'Xtreme MMA Mumbai', discipline: 'BJJ', classes: 8 },
  { name: 'Coach Siddhi', gym: 'Xtreme MMA Mumbai', discipline: 'Muay Thai', classes: 5 },
  { name: 'Coach Arjun', gym: 'Strike Lab Boxing', discipline: 'Boxing', classes: 6 },
]

const GYMS = [
  { name: 'Xtreme MMA Mumbai', city: 'Mumbai', disciplines: ['BJJ', 'Boxing', 'Muay Thai'] },
  { name: 'Strike Lab Boxing', city: 'Delhi', disciplines: ['Boxing'] },
]

const CLASSES = [
  { title: 'Boxing Fundamentals', gym: 'Strike Lab Boxing', level: 'Beginner', status: 'scheduled' },
  { title: 'Advanced Guard Passing', gym: 'Xtreme MMA Mumbai', level: 'Advanced', status: 'live' },
  { title: 'Muay Thai Clinch Work', gym: 'Xtreme MMA Mumbai', level: 'Intermediate', status: 'scheduled' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function toResultItems(
  techniques: typeof TECHNIQUES,
  coaches: typeof COACHES,
  gyms: typeof GYMS,
  classes: typeof CLASSES,
): SearchResultItem[] {
  return [
    ...techniques.map(t => ({ category: 'technique' as const, ...t })),
    ...coaches.map(c => ({ category: 'coach' as const, ...c })),
    ...gyms.map(g => ({ category: 'gym' as const, ...g })),
    ...classes.map(c => ({ category: 'class' as const, ...c })),
  ]
}

function filterItems(query: string) {
  const q = query.toLowerCase().trim()

  const techniques = TECHNIQUES.filter(
    t => t.title.toLowerCase().includes(q) || t.example.toLowerCase().includes(q),
  )
  const coaches = COACHES.filter(
    c => c.name.toLowerCase().includes(q) || c.gym.toLowerCase().includes(q) || c.discipline.toLowerCase().includes(q),
  )
  const gyms = GYMS.filter(
    g => g.name.toLowerCase().includes(q) || g.city.toLowerCase().includes(q) || g.disciplines.some(d => d.toLowerCase().includes(q)),
  )
  const classes = CLASSES.filter(
    c => c.title.toLowerCase().includes(q) || c.gym.toLowerCase().includes(q) || c.level.toLowerCase().includes(q),
  )

  return { techniques, coaches, gyms, classes }
}

function popularItems() {
  return {
    techniques: TECHNIQUES.slice(0, 2),
    coaches: COACHES.slice(0, 2),
    gyms: GYMS.slice(0, 2),
    classes: CLASSES.slice(0, 2),
  }
}

type SectionResults = {
  techniques: typeof TECHNIQUES
  coaches: typeof COACHES
  gyms: typeof GYMS
  classes: typeof CLASSES
}

function buildFlatList(sections: SectionResults): SearchResultItem[] {
  return toResultItems(sections.techniques, sections.coaches, sections.gyms, sections.classes)
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-4 py-1.5 flex items-center gap-3">
      <span className="text-[#555] text-xs font-bold uppercase tracking-wider">{label}</span>
      <span className="flex-1 h-px bg-white/5" />
    </div>
  )
}

// ─── CommandPalette ───────────────────────────────────────────────────────────
interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function CommandPalette({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Escape to close
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const sections = useMemo(
    () => (query.trim() === '' ? popularItems() : filterItems(query)),
    [query],
  )

  const flatList = useMemo(() => buildFlatList(sections), [sections])

  const totalResults = flatList.length

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, totalResults - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && totalResults > 0) {
        // Future: navigate to result
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, totalResults, onClose])

  // Keep selected item in view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selectedIndex}"]`) as HTMLElement | null
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setSelectedIndex(0)
  }, [])

  // Build indexed result list for rendering
  let globalIdx = 0
  const sectionDefs: { key: keyof SectionResults; label: string }[] = [
    { key: 'techniques', label: 'Techniques' },
    { key: 'coaches', label: 'Coaches' },
    { key: 'gyms', label: 'Gyms' },
    { key: 'classes', label: 'Classes' },
  ]

  const hasAnyResults = totalResults > 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-0 z-50 pointer-events-none flex justify-center"
          >
            <div className="pointer-events-auto mt-20 max-w-2xl w-full mx-4 bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl self-start flex flex-col">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
                <Search size={18} className="text-[#555] shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={handleQueryChange}
                  placeholder="Search techniques, coaches, gyms, classes..."
                  className="flex-1 bg-transparent text-white text-base placeholder:text-[#444] focus:outline-none"
                />
                {query && (
                  <button onClick={() => { setQuery(''); inputRef.current?.focus() }} className="text-[#555] hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                )}
                <kbd className="hidden sm:flex items-center gap-1 shrink-0 text-[#444] text-xs bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-mono">
                  esc
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="overflow-y-auto max-h-96">
                {!hasAnyResults && query.trim() !== '' ? (
                  <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <p className="text-[#555] text-sm">No results for &ldquo;{query}&rdquo;</p>
                    <p className="text-[#444] text-xs">Try searching for a technique, coach, or gym</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {query.trim() === '' && (
                      <div className="px-4 py-2">
                        <span className="text-[#444] text-xs font-bold uppercase tracking-wider">Popular searches</span>
                      </div>
                    )}

                    {sectionDefs.map(({ key, label }) => {
                      const items = sections[key] as any[]
                      if (items.length === 0) return null

                      const sectionResults = toResultItems(
                        key === 'techniques' ? (items as typeof TECHNIQUES) : [],
                        key === 'coaches' ? (items as typeof COACHES) : [],
                        key === 'gyms' ? (items as typeof GYMS) : [],
                        key === 'classes' ? (items as typeof CLASSES) : [],
                      )

                      return (
                        <div key={key}>
                          {query.trim() !== '' && <SectionHeader label={label} />}
                          {sectionResults.map(result => {
                            const idx = globalIdx++
                            return (
                              <div key={idx} data-idx={idx}>
                                <SearchResult
                                  result={result}
                                  isSelected={selectedIndex === idx}
                                  onClick={onClose}
                                />
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-white/5 flex items-center gap-4 text-[#444] text-xs">
                <span className="flex items-center gap-1">
                  <kbd className="bg-white/5 border border-white/10 rounded px-1 py-0.5 font-mono">↑↓</kbd> navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-white/5 border border-white/10 rounded px-1 py-0.5 font-mono">↵</kbd> select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-white/5 border border-white/10 rounded px-1 py-0.5 font-mono">esc</kbd> close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
