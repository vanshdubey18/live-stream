import { ReactNode } from 'react'

interface Props {
  /** Big faded Bebas word rendered behind the message (e.g. "LIVE", "EARN"). */
  ghost: string
  /** Primary message. */
  message: string
  /** Optional action (button or link). */
  children?: ReactNode
  /** Vertical padding size. */
  size?: 'sm' | 'md'
}

/**
 * Brand empty-state: a large faded Bebas watermark behind a short message.
 * The signature MATPEAK treatment so blank states feel intentional, not broken.
 */
export default function EmptyState({ ghost, message, children, size = 'md' }: Props) {
  const pad = size === 'sm' ? 'py-8' : 'py-12'
  return (
    <div className={`relative bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 ${pad} text-center overflow-hidden`}>
      <span className="absolute inset-0 flex items-center justify-center font-bebas text-[120px] text-white/[0.03] leading-none select-none pointer-events-none">
        {ghost}
      </span>
      <p className="relative font-inter text-[#555555] text-sm">{message}</p>
      {children && <div className="relative mt-5">{children}</div>}
    </div>
  )
}
