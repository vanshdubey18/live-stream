'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

export default function GymGateHeader() {
  const router = useRouter()

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-[#141410] border-b border-[#322f26] px-6 h-14 flex items-center justify-between">
      <span className="font-mincho tracking-[2px] text-xl text-[#b3402f]">MATPEAK</span>
      <button
        onClick={async () => { await createClient().auth.signOut(); router.push('/login') }}
        className="flex items-center gap-2 font-mincho text-sm text-[#7a7568] hover:text-[#f0eadc] transition-colors"
      >
        <LogOut size={16} /> Log out
      </button>
    </div>
  )
}
