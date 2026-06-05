# MATPEAK — Project Guide for Claude Code

MATPEAK is a combat-sports **live-streaming platform**. Gyms stream live classes (BJJ, Boxing, Muay Thai, Wrestling, MMA, Kickboxing, Judo, Sambo); members watch live + replays. Three sides: **member**, **gym owner**, **admin**.

Stack: Next.js (App Router) · TypeScript · Tailwind · Supabase (auth + Postgres) · Mux (streaming) · Framer Motion · Stripe.

---

## ⚠️ Design Philosophy — Read This First

This product has a **deliberate athletic-editorial brand** (think Nike / Whoop / Under Armour, not a generic SaaS dashboard). Every screen must feel intentional and premium. **Do not produce "AI slop."**

You converge toward generic, on-distribution output unless told otherwise. In this codebase that is a **bug**. Avoid:
- ❌ Generic font choices (never introduce Roboto, Arial, system-ui as display type)
- ❌ Clichéd schemes — **no purple gradients**, no rainbow accents, no candy colors
- ❌ Timid, evenly-distributed greys with no focal point
- ❌ Predictable centered-card layouts with a sad one-line empty state
- ❌ `font-bold` for headings (we use a display face — see below)
- ❌ Soft pill-shaped everything (`rounded-full`, `rounded-xl`) — our look is sharp

When in doubt, match the **landing page** (`src/app/page.tsx`) and the **member/gym dashboards** — they are the reference for the brand.

---

## Design System (authoritative)

### Type
- **Display / headings:** Bebas Neue → `font-bebas` (uppercase, condensed, `tracking-[1px]`). Use for all headlines, stat numbers, buttons, status badges.
- **Body / UI:** Inter → `font-inter`. Labels, table content, paragraphs. (Inter is acceptable **only** as the secondary UI face paired with Bebas — never as display type.)
- **Never** use `font-bold` to fake a heading. Reach for `font-bebas`.

### Color (defined in `tailwind.config.ts` + `globals.css`)
| Role | Hex | Usage |
|---|---|---|
| Background base | `#0D0D0D` | Page background |
| Surface | `#1A1A1A` | Cards |
| Elevated / hover | `#222222` | Hover states, raised surfaces |
| Border default | `#333333` | Standard borders, grid gaps |
| Border subtle | `#2A2A2A` | Faint dividers |
| Text primary | `#FFFFFF` | Headings, key values |
| Text secondary | `#999999` | Supporting copy |
| Text muted | `#555555` | De-emphasized, captions |
| **Accent — Red** | `#FF3B3B` | Brand accent, LIVE, primary emphasis |
| Accent — Teal | `#00D4AA` | Success / active membership |
| Accent — Amber | `#FFD60A` | Warning / pending / expiring |

Rule: **one dominant accent (red) with sharp, sparing use.** Teal/amber are status-only. Don't sprinkle accents evenly.

### Shape & spacing
- Radius: `rounded-sm` (2px) almost everywhere. Never `rounded-xl`/`rounded-full` on cards.
- Container: `max-w-[1280px] mx-auto px-6` (dashboards use `max-w-5xl`/`max-w-6xl`).
- Section rhythm: `py-8`/`py-12`/`py-20`; dashboard content `space-y-8`.

---

## Signature Brand Motifs (use these — they ARE the brand)

1. **Red eyebrow-line section labels.** Every section header is a red accent line + red uppercase label, NOT plain grey text:
   ```tsx
   <div className="flex items-center gap-3 mb-4">
     <div className="w-5 h-px bg-[#FF3B3B]" />
     <p className="font-inter text-[11px] text-[#FF3B3B] tracking-[4px] uppercase">Section Label</p>
   </div>
   ```

2. **Red left-bar accent on the primary stat** of a screen (one anchor per page):
   ```tsx
   <div className="relative">
     <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#FF3B3B] z-10" />
     {/* stat card */}
   </div>
   ```

3. **Ghost-watermark empty states** — never a bare one-liner. Big faded Bebas word behind the message:
   ```tsx
   <div className="relative bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-12 text-center overflow-hidden">
     <span className="absolute inset-0 flex items-center justify-center font-bebas text-[120px] text-white/[0.03] leading-none select-none pointer-events-none">LIVE</span>
     <p className="relative font-inter text-[#555555] text-sm">No sessions yet…</p>
   </div>
   ```

4. **Full-bleed photography** for hero/marketing surfaces — image fills the viewport with a strong left-to-transparent dark gradient + warm red `mix-blend-overlay` tint. Grayscale + contrast for drama. (See `Hero` in `src/app/page.tsx`.) Never a boxed image beside a hollow black panel.

5. **LIVE treatment:** red dot + `live-pulse` / `live-pulse-border` animation (defined in `globals.css`). Reserve the pulse strictly for genuinely-live states.

6. **Motion:** Framer Motion fade/slide on mount (`initial`/`animate`/`whileInView`), short (0.2–0.3s) staggered by `delay: i * 0.04`. Subtle, never bouncy.

---

## Anti-Slop Fingerprint Check (the tells that scream "AI made this")

Before shipping a screen, scan for these default fingerprints. Each is a habit the model falls into unprompted — if you see one, it's almost certainly slop, not a decision:

- ❌ **Teal sprinkled as a general accent.** Teal (`#00D4AA`) is **status-only** (active/success). If teal is doing decoration or drawing the eye on a non-status element, it's wrong — red is the only decorative accent.
- ❌ **Decorative accent bars.** The red left-bar (motif #2) is **semantic: one per screen, on the primary stat only.** Never add it to every card "for style." A bar that doesn't mean "this is THE number" is decoration — delete it.
- ❌ **Container soup.** Card wrapping a card wrapping a padded pill. **Cap nesting at 2 levels.** If you're adding a third border/background layer, flatten instead.
- ❌ **Blinking-dot reflex.** A pulsing live-dot only belongs on a genuinely-live state (motif #5). Don't animate dots on idle/scheduled/static items.
- ❌ **Three-column feature grid** as the default hero layout. We use full-bleed photography (motif #4) and asymmetric stat strips — not the generic 3-up icon-card row.
- ❌ **Evenly-distributed greys with no focal point.** Every screen needs ONE anchor (the red left-bar stat, or a Bebas hero number). If everything is the same weight, nothing reads.
- ❌ **Mixed icon families.** Lucide only (already the project default). Don't import a second icon set.
- ❌ **Generated/placeholder imagery that ignores the palette.** Any photo must be grayscale + contrast + the warm red `mix-blend-overlay` so it sits inside the brand, never a raw stock color image.

## Anchor Discipline (the MATPEAK system must "hold")

MATPEAK is a **locked aesthetic anchor** — athletic-editorial / industrial. Every screen is checked against fixed tokens, not vibes. If output drifts outside these ranges, *the anchor didn't hold* — fix it, don't ship it:

| Token | Locked value(s) | Drift = slop |
|---|---|---|
| Surfaces | `#0D0D0D` → `#1A1A1A` → `#222222` only | Any other grey/off-black |
| Decorative accent | `#FF3B3B` **only** | Teal/amber used decoratively |
| Display type | Bebas Neue, uppercase, `tracking-[1px]`+ | `font-bold`, any other display face |
| Body type | Inter | Inter used as *display* type |
| Radius | `rounded-sm` (2px) | `rounded-lg`/`xl`/`full` on cards |
| Focal point | exactly **one** anchor per screen | zero anchors, or three competing ones |

Rule of thumb: a new screen should be **indistinguishable in DNA** from `src/app/page.tsx` and the member/gym dashboards. If a reviewer can tell which screen was built last because it looks different, the anchor slipped. Match the reference, don't reinvent.

> The official `frontend-design` skill (installed at `.claude/skills/`) says "pick a bold direction per build." For MATPEAK that direction is **already chosen and locked above** — apply the skill's *principles* (distinctive type, dominant-accent palettes, atmospheric backgrounds, one orchestrated load animation) **inside** this anchor. Never invent a new aesthetic per screen.

---

## Two-Layer Membership Model (domain rule — don't break)
- **Membership** is permanent: `status='active'` stays until a gym explicitly removes a member. Expired members STILL show as "Member of X" on dashboard + gym page.
- **Content access** is time-gated by `free_until` / `current_period_end`. When expired → show an **"ACCESS LOCKED"** screen (not "no membership", not a redirect to /gyms). Helper pattern: `accessExpired(m)` = end date in the past.
- Members page shows three states: **Active** (teal) · **Access Expired** (amber) · **Removed** (red).

---

## Working Conventions
- Match surrounding code: comment density, naming, idiom. Server components fetch; client components (`'use client'`) render + interact.
- Reuse existing UI primitives: `StatCard`, `StatsCard` (gym), `AdminStatsCard`, `InsightCard`, `Toast`, `GymSidebar`/`MemberSidebar`/`AdminSidebar`.
- Disciplines list (8): BJJ, Boxing, Muay Thai, Wrestling, MMA, Kickboxing, Judo, Sambo. Keep these consistent across signup/profile/schedule/coach forms.
- Indian locale: currency in paise → `₹` via `(paise/100).toLocaleString('en-IN')`; dates `toLocaleDateString('en-IN', …)`.

## Verify before claiming done
- After UI changes, check the page actually renders (the `/run` or `/verify` skills, or Playwright if wired up). Don't assert "it works" without looking.
- Keep all three sides (member/gym/admin) visually consistent — a change to one dashboard's pattern usually belongs in the other two.
