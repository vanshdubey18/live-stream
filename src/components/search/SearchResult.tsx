'use client'

import { Building2, BookOpen, Radio } from 'lucide-react'

export type ResultCategory = 'technique' | 'coach' | 'gym' | 'class'

interface BaseResult {
  category: ResultCategory
  isSelected?: boolean
  onClick?: () => void
}

interface TechniqueResult extends BaseResult {
  category: 'technique'
  title: string
  sessions: number
  example: string
}

interface CoachResult extends BaseResult {
  category: 'coach'
  name: string
  gym: string
  discipline: string
  classes: number
}

interface GymResult extends BaseResult {
  category: 'gym'
  name: string
  city: string
  disciplines: string[]
}

interface ClassResult extends BaseResult {
  category: 'class'
  title: string
  gym: string
  level: string
  status: string
}

export type SearchResultItem = TechniqueResult | CoachResult | GymResult | ClassResult

const DISCIPLINE_COLORS: Record<string, string> = {
  BJJ: 'bg-blue-500/10 text-blue-400',
  Boxing: 'bg-yellow-500/10 text-yellow-400',
  'Muay Thai': 'bg-orange-500/10 text-orange-400',
  Wrestling: 'bg-green-500/10 text-green-400',
}

export default function SearchResult({ result, isSelected = false, onClick }: { result: SearchResultItem; isSelected?: boolean; onClick?: () => void }) {
  const base = `flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
    isSelected ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
  }`

  if (result.category === 'technique') {
    return (
      <div className={base} onClick={onClick}>
        <div className="w-8 h-8 rounded-lg bg-[#FF3B3B]/10 flex items-center justify-center shrink-0">
          <BookOpen size={14} className="text-[#FF3B3B]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{result.title}</p>
          <p className="text-[#555] text-xs truncate">{result.example}</p>
        </div>
        <span className="shrink-0 text-[#444] text-xs">{result.sessions} sessions</span>
      </div>
    )
  }

  if (result.category === 'coach') {
    return (
      <div className={base} onClick={onClick}>
        <div className="w-8 h-8 rounded-full bg-[#FF3B3B]/20 flex items-center justify-center shrink-0">
          <span className="text-[#FF3B3B] text-xs font-bold">{result.name.split(' ').map(w => w[0]).join('')}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{result.name}</p>
          <p className="text-[#555] text-xs truncate">{result.gym}</p>
        </div>
        <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${DISCIPLINE_COLORS[result.discipline] ?? 'bg-white/5 text-white/50'}`}>
          {result.discipline}
        </span>
      </div>
    )
  }

  if (result.category === 'gym') {
    return (
      <div className={base} onClick={onClick}>
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
          <Building2 size={14} className="text-[#888]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{result.name}</p>
          <p className="text-[#555] text-xs truncate">{result.city}</p>
        </div>
        <div className="shrink-0 flex gap-1">
          {result.disciplines.slice(0, 2).map(d => (
            <span key={d} className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${DISCIPLINE_COLORS[d] ?? 'bg-white/5 text-white/40'}`}>
              {d}
            </span>
          ))}
          {result.disciplines.length > 2 && (
            <span className="text-xs text-[#444]">+{result.disciplines.length - 2}</span>
          )}
        </div>
      </div>
    )
  }

  if (result.category === 'class') {
    return (
      <div className={base} onClick={onClick}>
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 relative">
          <Radio size={14} className={result.status === 'live' ? 'text-[#FF3B3B]' : 'text-[#888]'} />
          {result.status === 'live' && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#FF3B3B] animate-pulse" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{result.title}</p>
          <p className="text-[#555] text-xs truncate">{result.gym}</p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {result.status === 'live' && (
            <span className="text-[#FF3B3B] text-xs font-bold uppercase">Live</span>
          )}
          <span className="text-[#444] text-xs">{result.level}</span>
        </div>
      </div>
    )
  }

  return null
}
