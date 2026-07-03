'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, LayoutDashboard, LogOut, User } from 'lucide-react'
import LogoutButton from '@/components/auth/LogoutButton'

type Props = {
  email: string
  full_name?: string | null
  avatar_url?: string | null
  isAdmin?: boolean
}

export default function UserMenu({ email, full_name, avatar_url, isAdmin }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initial = (full_name || email).charAt(0).toUpperCase()
  const displayName = full_name || email

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 p-1.5 text-white/70 transition-colors hover:text-white"
        aria-label="Mi cuenta"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar_url} alt=""
            className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center bg-red-600 font-inter text-[11px] font-bold uppercase text-white">
            {initial}
          </span>
        )}
        <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 border border-white/10 bg-zinc-900 shadow-xl">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="truncate font-inter text-xs font-semibold text-white">
              {displayName}
            </p>
            {full_name && (
              <p className="mt-0.5 truncate font-inter text-[10px] text-white/40">
                {email}
              </p>
            )}
          </div>

          <div className="py-1">
            {isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 font-inter text-xs text-red-400 transition-colors hover:bg-white/5 hover:text-red-300">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Panel Admin
              </Link>
            )}
            <Link href="/account" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 font-inter text-xs text-white/55 transition-colors hover:bg-white/5 hover:text-white/90">
              <User className="h-3.5 w-3.5" />
              Mi cuenta
            </Link>
            <LogoutButton
              className="flex w-full items-center gap-3 px-4 py-2.5 font-inter text-xs text-white/55 transition-colors hover:bg-white/5 hover:text-white/90">
              <LogOut className="h-3.5 w-3.5" />
              Cerrar sesión
            </LogoutButton>
          </div>
        </div>
      )}
    </div>
  )
}
