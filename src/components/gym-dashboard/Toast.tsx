'use client'

import { useEffect } from 'react'
import { CheckCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  onClose: () => void
}

export default function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#1A1A1A] border border-[#00D4AA]/30 text-white px-5 py-3.5 rounded-sm animate-in slide-in-from-bottom-4 duration-300">
      <CheckCircle size={18} className="text-[#00D4AA] shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="text-[#999999] hover:text-white ml-1 transition-colors">
        <X size={15} />
      </button>
    </div>
  )
}
