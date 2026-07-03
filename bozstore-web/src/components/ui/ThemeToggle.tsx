'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const html = document.documentElement
    const next = !html.classList.contains('dark')
    html.classList.toggle('dark', next)
    localStorage.setItem('bos-theme', next ? 'dark' : 'light')
    setDark(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-white/10 ${className}`}
    >
      {dark
        ? <Sun  className="h-4 w-4 text-white/60"     />
        : <Moon className="h-4 w-4 text-zinc-500" />
      }
    </button>
  )
}
