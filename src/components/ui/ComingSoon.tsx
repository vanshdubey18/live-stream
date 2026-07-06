'use client'

import { motion } from 'framer-motion'
import { Construction } from 'lucide-react'

interface Props {
  title: string
  description?: string
  backHref?: string
  backLabel?: string
}

export default function ComingSoon({
  title,
  description = 'This feature is being built. Check back soon.',
  backHref,
  backLabel = 'Go back',
}: Props) {
  return (
    <main className="flex-1 lg:ml-64 min-w-0 min-h-screen bg-[#141410] flex items-center justify-center px-4 mt-14 lg:mt-0">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-4 max-w-sm"
      >
        <div className="w-14 h-14 rounded-sm bg-[#111] border border-[#322f26] flex items-center justify-center mx-auto">
          <Construction size={24} className="text-[#b3402f]" />
        </div>
        <h1 className="font-mincho text-2xl text-[#f0eadc] tracking-[1px]">{title}</h1>
        <p className="text-[#a29c8c] text-sm leading-relaxed">{description}</p>
        {backHref && (
          <a
            href={backHref}
            className="inline-block text-[#b3402f] text-sm font-medium hover:underline mt-2"
          >
            ← {backLabel}
          </a>
        )}
      </motion.div>
    </main>
  )
}
