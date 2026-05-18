export type UserRole = 'member' | 'gym' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
}

export interface Gym {
  id: string
  owner_id: string
  name: string
  description: string | null
  logo_url: string | null
  is_verified: boolean
  created_at: string
}

export interface Event {
  id: string
  gym_id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  mux_stream_key: string | null
  mux_playback_id: string | null
  status: 'scheduled' | 'live' | 'ended'
  scheduled_at: string
  created_at: string
}

export interface Membership {
  id: string
  user_id: string
  plan: 'monthly' | 'annual'
  status: 'active' | 'cancelled' | 'expired'
  razorpay_subscription_id: string | null
  current_period_end: string
  created_at: string
}
