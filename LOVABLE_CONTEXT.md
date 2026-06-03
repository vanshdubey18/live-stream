# Matpeak — Codebase Context for Lovable

## What this app is
Matpeak is a martial arts live-streaming SaaS for Indian gyms. Think "Peloton for combat sports." Three types of users:
- **Gym owners** — stream live classes, manage members, view revenue
- **Members** — join gyms, watch live classes and replays
- **Admins** — approve gyms, manage coupons, oversee the platform

## Tech stack
- **Next.js 14 App Router** (TypeScript)
- **Tailwind CSS** for all styling
- **Framer Motion** (already installed) for animations
- **Supabase** for auth + database (PostgreSQL)
- **Mux** for live video streaming
- **Lucide React** for icons

---

## Design system — DO NOT change these values

| Token | Value | Usage |
|-------|-------|-------|
| Background primary | `#0D0D0D` | Page backgrounds |
| Background surface | `#1A1A1A` | Cards, panels |
| Background elevated | `#222222` | Inputs, hover states |
| Border subtle | `#2A2A2A` | Inner dividers |
| Border default | `#333333` | Card borders |
| Text primary | `#FFFFFF` | Headings |
| Text secondary | `#999999` | Body copy |
| Text muted | `#555555` | Labels, meta |
| Accent red | `#FF3B3B` | CTAs, live indicators, hover accents |
| Green | `#00D4AA` | Success, active status |
| Yellow | `#FFD60A` | Warning, expiring |

**Fonts:**
- `font-bebas` = Bebas Neue — used for ALL headings, stats, labels
- `font-inter` = Inter — used for body text, descriptions, metadata

**Border radius:** `rounded-sm` everywhere (no rounded-lg, no rounded-full except dots/pills)

---

## App structure

```
src/app/
  page.tsx                          ← Landing page (public)
  (auth)/
    login/page.tsx                  ← Login
    signup/page.tsx                 ← Sign up
    onboarding/page.tsx             ← Post-signup role selection
  (member)/
    dashboard/page.tsx              ← Member home (SERVER component)
    dashboard/DashboardClient.tsx   ← Member home UI (CLIENT)
    dashboard/schedule/page.tsx     ← Member class schedule (SERVER)
    dashboard/schedule/MemberScheduleClient.tsx ← Schedule UI (CLIENT)
    dashboard/replays/page.tsx      ← Replay library
    gyms/page.tsx                   ← Browse gyms
    gyms/[slug]/page.tsx            ← Gym detail + join
    watch/[id]/page.tsx             ← Watch live class (SERVER — has auth guard)
    watch/[id]/WatchClient.tsx      ← Video player UI (CLIENT)
    replay/[id]/page.tsx            ← Watch replay (SERVER — has auth guard)
  (gym)/
    gym-signup/page.tsx             ← Gym owner registration
    gym-dashboard/page.tsx          ← Gym home (SERVER)
    gym-dashboard/GymDashboardClient.tsx ← Gym home UI (CLIENT)
    gym-dashboard/members/page.tsx  ← Member roster (SERVER)
    gym-dashboard/members/MembersClient.tsx ← Roster UI (CLIENT)
    gym-dashboard/schedule/page.tsx ← Schedule classes (SERVER)
    gym-dashboard/schedule/ScheduleClient.tsx ← Schedule UI (CLIENT)
    gym-dashboard/revenue/page.tsx  ← Revenue (SERVER)
    gym-dashboard/revenue/RevenueClient.tsx ← Revenue UI (CLIENT)
    gym-dashboard/analytics/page.tsx ← Analytics (SERVER)
    gym-dashboard/analytics/AnalyticsClient.tsx ← Analytics UI (CLIENT)
    gym-dashboard/stream/page.tsx   ← Stream setup (SERVER)
    gym-dashboard/stream/StreamSetupPageClient.tsx ← Stream UI (CLIENT)
    gym-dashboard/coaches/page.tsx  ← Coaches management
    gym-dashboard/profile/page.tsx  ← Gym profile
  (admin)/
    admin/page.tsx                  ← Admin overview
    admin/applications/page.tsx     ← Gym approval queue
    admin/applications/[id]/page.tsx ← Application detail + approve/reject
    admin/members/page.tsx          ← All platform members
    admin/gyms/page.tsx             ← All gyms
    admin/coupons/page.tsx          ← Coupon management
```

---

## Critical rule: SERVER vs CLIENT components

**`page.tsx` files are SERVER components.** They:
- Fetch data from Supabase
- Check auth and redirect if not logged in
- Check membership expiry and block access
- Pass data as props to `*Client.tsx` files

**`*Client.tsx` files are CLIENT components** (`'use client'` at top). They:
- Receive data as props
- Handle all interactivity (modals, filters, state)
- Are safe to edit for visual changes

### ⚠️ DO NOT touch `page.tsx` files unless I explicitly ask
Touching server components can break auth guards, data fetching, and redirects. Always edit the `*Client.tsx` file instead.

---

## What NOT to change (ever)

1. Any file in `src/app/api/` — these are backend API routes
2. Any file in `src/lib/` — Supabase client, queries, Mux integration
3. `page.tsx` server components (the ones that don't have `'use client'`)
4. `src/middleware.ts` if it exists
5. `tailwind.config.ts` — font and color aliases are already set up
6. `src/app/globals.css` — animation classes like `.live-pulse` are used throughout

---

## Components to know

```
src/components/
  layout/
    Navbar.tsx          ← Public navbar (landing page)
    MemberSidebar.tsx   ← Left sidebar for member dashboard
    GymSidebar.tsx      ← Left sidebar for gym dashboard
    AdminSidebar.tsx    ← Left sidebar for admin
    Footer.tsx          ← Landing page footer
  gym-dashboard/
    StatsCard.tsx       ← Reusable stat card (supports optional href)
    Toast.tsx           ← Toast notification
    ScheduleClassModal.tsx ← Modal to create/edit a class
    GoLiveModal.tsx     ← Modal to start streaming
    AddCoachModal.tsx   ← Modal to add a coach
  member/
    GymCard.tsx         ← Card on the browse gyms page
    ClassRow.tsx        ← Row in a class list
    ReplayCard.tsx      ← Card in the replay library
  ui/
    ComingSoon.tsx      ← Placeholder for unbuilt pages
    ProgressRing.tsx    ← SVG circular progress
```

---

## Safe test pages to start with

These are pure visual components with no critical business logic:

1. **`src/app/page.tsx`** — Landing page. Fully client-side, self-contained. Safe to restyle completely.
2. **`src/app/(member)/dashboard/DashboardClient.tsx`** — Member dashboard UI. Gets data from server but all styling is here.
3. **`src/app/(gym)/gym-dashboard/GymDashboardClient.tsx`** — Gym owner home UI.

---

## Current visual style

The app is a minimal dark-theme SaaS. Think Vercel dashboard meets combat sports. Current look:
- Pure black backgrounds, thin `1px` borders
- Bebas Neue for display text (all caps, tracked)
- No gradients, no glassmorphism currently
- Cards are flat `#1A1A1A` with `#333333` borders
- The accent `#FF3B3B` is used sparingly

**Desired upgrade direction:** More premium/luxury dark — subtle radial gradients behind key sections, depth on cards (faint gradient from `#1A1A1A` to `#111111`), glow on live/accent elements, smoother hover transitions, better spacing rhythm.

---

## Database tables (for context, don't touch)

- `gyms` — gym profile, owner_id, status (pending/active/rejected), mux credentials
- `sessions` — classes: title, discipline, scheduled_at, status (scheduled/live/ended), mux_playback_id
- `memberships` — user_id + gym_id + plan_type + free_until + current_period_end + status
- `coaches` — name, discipline, belt_rank, bio, gym_id
- `coupons` — code, gym_id, duration_days, max_uses

---

## Git branch
All changes go to branch: `claude/reset-previous-options-T7A91`
Repo: `vanshdubey18/live-stream`
