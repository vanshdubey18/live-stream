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
    <div className={`relative bg-[#1c1c16] border border-[#322f26] rounded-sm px-6 ${pad} text-center overflow-hidden`}>
      <span className="absolute inset-0 flex items-center justify-center font-mincho text-[120px] text-[#f0eadc]/[0.03] leading-none select-none pointer-events-none">
        {ghost}
      </span>
      <p className="relative font-mincho text-[#7a7568] text-sm">{message}</p>
      {children && <div className="relative mt-5">{children}</div>}
    </div>
  )
}
