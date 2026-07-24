'use client'

import { useState } from 'react'
import {
  Zen_Old_Mincho,
  Marcellus,
  Cormorant_Garamond,
  Fraunces,
  Instrument_Serif,
  Stardos_Stencil,
  Allerta_Stencil,
  Rye,
  Anton,
  Bungee,
  Passion_One,
  Oswald,
  Inter,
} from 'next/font/google'

// Candidate display faces for the Dark Dojo system — compare at /font-preview
const zenOldMincho = Zen_Old_Mincho({ weight: ['400', '500', '600'], subsets: ['latin'] })
const marcellus = Marcellus({ weight: '400', subsets: ['latin'] })
const cormorant = Cormorant_Garamond({ weight: ['400', '500', '600'], subsets: ['latin'] })
const fraunces = Fraunces({ weight: ['300', '400', '500'], subsets: ['latin'] })
const instrumentSerif = Instrument_Serif({ weight: '400', subsets: ['latin'] })
const stardosStencil = Stardos_Stencil({ weight: ['400', '700'], subsets: ['latin'] })
const allertaStencil = Allerta_Stencil({ weight: '400', subsets: ['latin'] })
const rye = Rye({ weight: '400', subsets: ['latin'] })
const anton = Anton({ weight: '400', subsets: ['latin'] })
const bungee = Bungee({ weight: '400', subsets: ['latin'] })
const passionOne = Passion_One({ weight: ['700', '900'], subsets: ['latin'] })
const oswald = Oswald({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

const CANDIDATES = [
  {
    key: 'F1',
    name: 'Zen Old Mincho',
    className: zenOldMincho.className,
    note: 'Same Japanese-mincho family as the current font, but crisper and less spindly at large sizes. The safest upgrade.',
  },
  {
    key: 'F2',
    name: 'Marcellus',
    className: marcellus.className,
    note: 'Calm, engraved, slightly Roman. Very steady and formal — reads like a plaque in a dojo.',
  },
  {
    key: 'F3',
    name: 'Cormorant Garamond',
    className: cormorant.className,
    note: 'High-contrast classical serif. The most elegant and editorial of the set — thin strokes, big presence.',
  },
  {
    key: 'F4',
    name: 'Fraunces',
    className: fraunces.className,
    note: 'Modern editorial serif with personality — soft, slightly wonky details. The most "startup brand" of the serifs.',
  },
  {
    key: 'F5',
    name: 'Instrument Serif',
    className: instrumentSerif.className,
    note: 'Sharp, contemporary, display-only serif. Punchy at big sizes — pair with Inter for all body/UI text.',
  },
]

// Bold/stencil/road-sign-adjacent candidates — the "distressed sign" direction
const STENCIL_CANDIDATES = [
  {
    key: 'S1',
    name: 'Stardos Stencil',
    className: stardosStencil.className,
    note: 'Rounded stencil-cut gaps, bold and hand-cut looking. Closest single match to the road-sign lettering.',
  },
  {
    key: 'S2',
    name: 'Allerta Stencil',
    className: allertaStencil.className,
    note: 'Cleaner, more geometric stencil cut. Reads more industrial/military than hand-painted.',
  },
  {
    key: 'S3',
    name: 'Rye',
    className: rye.className,
    note: 'Bold western/rugged slab with a hand-carved feel. Closer to the "Casco" wordmark\'s thick marker weight — not a literal stencil, but the closest mood match.',
  },
  {
    key: 'S4',
    name: 'Anton',
    className: anton.className,
    note: 'Ultra-condensed, ultra-bold industrial sans. No stencil cut, but massive presence at any size — reads athletic/aggressive, closest thing to a "Bebas Neue but heavier."',
  },
  {
    key: 'S5',
    name: 'Bungee',
    className: bungee.className,
    note: 'Chunky, urban, sign-painter-esque display face. More poster/street-sign than stencil, but shares the bold-block DNA.',
  },
  {
    key: 'S6',
    name: 'Passion One',
    className: passionOne.className,
    note: 'Rounded, heavy, poster-bold. Softer and friendlier than the others — a lower-drama option if the full distressed look is too much.',
  },
  {
    key: 'S7',
    name: 'Oswald',
    className: oswald.className,
    note: 'Condensed grotesque, the actual closest Google Fonts match to Bebas Neue (this codebase\'s documented but unused brand anchor). Clean, no texture — the "safe athletic" option.',
  },
]

// SVG feTurbulence noise, applied as a low-opacity overlay via mix-blend-mode
const GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export default function FontPreviewPage() {
  const [grain, setGrain] = useState(false)

  return (
    <main className="min-h-screen bg-[#141410] text-[#f0eadc] px-6 py-16">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <p className={`${inter.className} text-[11px] text-[#b3402f] tracking-[5px] uppercase mb-3`}>
            Font Preview — internal
          </p>
          <h1 className={`${inter.className} text-2xl text-[#f0eadc]`}>
            Display-font candidates, same Dark Dojo palette
          </h1>
          <p className={`${inter.className} text-sm text-[#7a7568] mt-2 max-w-xl mx-auto`}>
            Body/UI text in every sample below is Inter — the idea is a distinctive display face for headlines
            and numbers only, with a quiet modern sans for everything else.
          </p>
        </div>

        <div className="space-y-20">
          {CANDIDATES.map(({ key, name, className, note }) => (
            <section key={key} className="border-t border-[#322f26] pt-10">
              <div className="flex items-baseline gap-4 mb-8">
                <span className={`${inter.className} text-[12px] text-[#635f54] tracking-[3px]`}>{key}</span>
                <h2 className={`${inter.className} text-lg text-[#f0eadc]`}>{name}</h2>
              </div>

              {/* Hero sample */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-6 h-px bg-[#b3402f]" />
                  <p className={`${inter.className} text-[11px] text-[#b3402f] tracking-[4px] uppercase`}>
                    Combat Sports · Live Training
                  </p>
                </div>
                <div className={`${className} leading-[1.02]`} style={{ fontSize: 'clamp(44px, 6.5vw, 84px)' }}>
                  <span className="block text-[#f0eadc]">World-class training.</span>
                  <span className="block text-[#b3402f]">Wherever you are.</span>
                </div>
                <p className={`${inter.className} text-[#a29c8c] text-base mt-6 max-w-[420px] leading-relaxed`}>
                  Stream live classes from real MMA gyms. BJJ. Boxing. Muay Thai. Wrestling.
                  Train from anywhere in the world.
                </p>
              </div>

              {/* Stats + card sample */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-6 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#b3402f]" />
                  <p className={`${inter.className} text-[10px] text-[#7a7568] tracking-[3px] uppercase mb-3`}>Streak</p>
                  <p className={`${className} text-5xl text-[#c25040] leading-none`}>14</p>
                  <p className={`${inter.className} text-xs text-[#635f54] mt-2 italic`}>days on the mat</p>
                </div>
                <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-6">
                  <p className={`${inter.className} text-[10px] text-[#7a7568] tracking-[3px] uppercase mb-3`}>Classes</p>
                  <p className={`${className} text-5xl text-[#f0eadc] leading-none`}>62</p>
                  <p className={`${inter.className} text-xs text-[#635f54] mt-2 italic`}>this season</p>
                </div>
                <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-6">
                  <p className={`${inter.className} text-[10px] text-[#7a7568] tracking-[3px] uppercase mb-3`}>Live Now</p>
                  <p className={`${className} text-2xl text-[#f0eadc] leading-tight`}>Clinch Control Drills</p>
                  <p className={`${inter.className} text-xs text-[#635f54] mt-2`}>Muay Thai · Coach Rahul Sharma</p>
                </div>
              </div>

              <p className={`${inter.className} text-sm text-[#7a7568] mt-6 italic max-w-xl`}>{note}</p>
            </section>
          ))}
        </div>

        {/* Stencil / road-sign direction */}
        <div className="mt-24 pt-16 border-t-2 border-[#b3402f]/30">
          <div className="text-center mb-4">
            <p className={`${inter.className} text-[11px] text-[#b3402f] tracking-[5px] uppercase mb-3`}>
              Weathered Stencil / Road-Sign Direction
            </p>
            <h2 className={`${inter.className} text-xl text-[#f0eadc]`}>
              Bold, hand-cut, sign-painter candidates
            </h2>
            <p className={`${inter.className} text-sm text-[#7a7568] mt-2 max-w-xl mx-auto`}>
              No Google Font ships with baked-in rust/weathering — the grain toggle below approximates that
              texture with a CSS noise overlay so you can compare clean vs. distressed.
            </p>
            <button
              onClick={() => setGrain((g) => !g)}
              className={`${inter.className} mt-6 text-xs tracking-[2px] uppercase px-5 py-2 border rounded-sm transition-colors ${
                grain
                  ? 'bg-[#b3402f] border-[#b3402f] text-[#141410]'
                  : 'border-[#322f26] text-[#a29c8c] hover:border-[#b3402f]'
              }`}
            >
              Grain overlay: {grain ? 'On' : 'Off'}
            </button>
          </div>

          <div className="space-y-20 mt-16">
            {STENCIL_CANDIDATES.map(({ key, name, className, note }) => (
              <section key={key} className="border-t border-[#322f26] pt-10">
                <div className="flex items-baseline gap-4 mb-8">
                  <span className={`${inter.className} text-[12px] text-[#635f54] tracking-[3px]`}>{key}</span>
                  <h2 className={`${inter.className} text-lg text-[#f0eadc]`}>{name}</h2>
                </div>

                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-6 h-px bg-[#b3402f]" />
                    <p className={`${inter.className} text-[11px] text-[#b3402f] tracking-[4px] uppercase`}>
                      Combat Sports · Live Training
                    </p>
                  </div>
                  <div className="relative inline-block">
                    <div className={`${className} leading-[1.05] uppercase`} style={{ fontSize: 'clamp(40px, 6vw, 78px)' }}>
                      <span className="block text-[#f0eadc]">World-class training.</span>
                      <span className="block text-[#b3402f]">Wherever you are.</span>
                    </div>
                    {grain && (
                      <div
                        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40"
                        style={{ backgroundImage: GRAIN_URL }}
                      />
                    )}
                  </div>
                  <p className={`${inter.className} text-[#a29c8c] text-base mt-6 max-w-[420px] leading-relaxed`}>
                    Stream live classes from real MMA gyms. BJJ. Boxing. Muay Thai. Wrestling.
                    Train from anywhere in the world.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-6 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#b3402f] z-10" />
                    <p className={`${inter.className} text-[10px] text-[#7a7568] tracking-[3px] uppercase mb-3`}>Streak</p>
                    <p className={`${className} text-5xl text-[#c25040] leading-none`}>14</p>
                    <p className={`${inter.className} text-xs text-[#635f54] mt-2 italic`}>days on the mat</p>
                    {grain && (
                      <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40" style={{ backgroundImage: GRAIN_URL }} />
                    )}
                  </div>
                  <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-6 relative overflow-hidden">
                    <p className={`${inter.className} text-[10px] text-[#7a7568] tracking-[3px] uppercase mb-3`}>Classes</p>
                    <p className={`${className} text-5xl text-[#f0eadc] leading-none`}>62</p>
                    <p className={`${inter.className} text-xs text-[#635f54] mt-2 italic`}>this season</p>
                    {grain && (
                      <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40" style={{ backgroundImage: GRAIN_URL }} />
                    )}
                  </div>
                  <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-6 relative overflow-hidden">
                    <p className={`${inter.className} text-[10px] text-[#7a7568] tracking-[3px] uppercase mb-3`}>Live Now</p>
                    <p className={`${className} text-2xl text-[#f0eadc] leading-tight uppercase`}>Clinch Control Drills</p>
                    <p className={`${inter.className} text-xs text-[#635f54] mt-2`}>Muay Thai · Coach Rahul Sharma</p>
                    {grain && (
                      <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40" style={{ backgroundImage: GRAIN_URL }} />
                    )}
                  </div>
                </div>

                <p className={`${inter.className} text-sm text-[#7a7568] mt-6 italic max-w-xl`}>{note}</p>
              </section>
            ))}
          </div>
        </div>

        <p className={`${inter.className} text-center text-xs text-[#635f54] mt-20`}>
          Temporary page — will be removed once a font is picked.
        </p>
      </div>
    </main>
  )
}
