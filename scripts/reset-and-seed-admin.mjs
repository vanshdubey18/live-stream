/**
 * One-time fresh-start script.
 *
 * Wipes ALL app data + ALL auth accounts, then creates a single admin account.
 * Runs locally against your Supabase project using the service role key from
 * .env.local — your machine can reach Supabase (this is run on your computer,
 * not in the cloud sandbox).
 *
 * Usage:
 *   node scripts/reset-and-seed-admin.mjs <admin-email> <admin-password>
 *
 * Example:
 *   node scripts/reset-and-seed-admin.mjs admin@matpeak.com SuperSecret123
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// ── Load env from .env.local (no dotenv dependency needed) ──────────────────
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')
let env = {}
try {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch {
  console.error('Could not read .env.local — run this from the project root.')
  process.exit(1)
}

const URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const [adminEmail, adminPassword] = process.argv.slice(2)
if (!adminEmail || !adminPassword) {
  console.error('Usage: node scripts/reset-and-seed-admin.mjs <admin-email> <admin-password>')
  process.exit(1)
}

const db = createClient(URL, SERVICE_KEY, { auth: { persistSession: false } })

// ── 1. Wipe all app data (child tables first) ───────────────────────────────
const tables = [
  'coupon_redemptions',
  'payouts',
  'watch_history',
  'memberships',
  'sessions',
  'coaches',
  'gyms',
  'coupons',
  'users',
]

console.log('Wiping app data...')
for (const t of tables) {
  const { error } = await db.from(t).delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (error && !/does not exist/i.test(error.message)) {
    console.warn(`  ${t}: ${error.message}`)
  } else {
    console.log(`  cleared ${t}`)
  }
}

// ── 2. Delete ALL auth accounts ─────────────────────────────────────────────
console.log('Deleting all auth accounts...')
let page = 1
let deleted = 0
while (true) {
  const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 })
  if (error) { console.error('listUsers:', error.message); break }
  if (!data.users.length) break
  for (const u of data.users) {
    const { error: delErr } = await db.auth.admin.deleteUser(u.id)
    if (delErr) console.warn(`  could not delete ${u.email}: ${delErr.message}`)
    else deleted++
  }
  if (data.users.length < 1000) break
  page++
}
console.log(`  deleted ${deleted} account(s)`)

// ── 3. Create the fresh admin ───────────────────────────────────────────────
console.log(`Creating admin ${adminEmail}...`)
const { data: created, error: createErr } = await db.auth.admin.createUser({
  email: adminEmail,
  password: adminPassword,
  email_confirm: true,
  user_metadata: { role: 'admin', full_name: 'Admin' },
})
if (createErr) {
  console.error('  failed:', createErr.message)
  process.exit(1)
}
console.log(`  created admin id ${created.user.id}`)

console.log('\n✅ Done. Database is fresh with one admin account.')
console.log(`   Log in at /login with ${adminEmail}`)
