'use client'

import { useState, useEffect, useCallback } from 'react'
import CommandPalette from './CommandPalette'

interface Props {
  children: React.ReactNode
}

export default function SearchProvider({ children }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    // Listen for custom event dispatched by sidebar / other UI
    const handleCustomEvent = () => open()
    window.addEventListener('open-search', handleCustomEvent)
    return () => window.removeEventListener('open-search', handleCustomEvent)
  }, [open])

  useEffect(() => {
    // Ctrl+K / Cmd+K shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(v => !v)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      {children}
      <CommandPalette isOpen={isOpen} onClose={close} />
    </>
  )
}
