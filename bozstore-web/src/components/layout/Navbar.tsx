'use client'

import { useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { Gamepad2, LogIn, LogOut, X } from 'lucide-react'
import UserMenu from '@/components/auth/UserMenu'
import LogoutButton from '@/components/auth/LogoutButton'

export type NavUser = {
  email: string
  full_name?: string | null
  avatar_url?: string | null
} | null

const NAV_LINKS = [
  { label: 'Catálogo',  href: '/games'     },
  { label: 'Novedades', href: '/novedades' },
  { label: 'Ofertas',   href: '/ofertas'   },
] as const

export default function Navbar({ user = null }: { user?: NavUser }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const itemStyle = (i: number): CSSProperties => ({
    transitionProperty: 'opacity, transform',
    transitionDuration: '500ms',
    transitionDelay: `${i * 80 + 100}ms`,
    opacity: menuOpen ? 1 : 0,
    transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
  })

  return (
    <>
      <header className="flex items-center justify-between px-6 py-5 sm:px-10 lg:px-16 lg:py-7">
        {/* Brand */}
        <Link href="/"
          className="font-podium text-2xl font-bold uppercase tracking-wider text-white sm:text-3xl">
          Bos<span className="text-red-600">Store</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex lg:gap-10">
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={label} href={href}
              className="font-inter text-sm uppercase tracking-widest text-white/70 transition-colors hover:text-white">
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link href="/games"
                className="inline-flex items-center gap-2 bg-red-600 px-5 py-2.5 font-inter text-xs uppercase tracking-widest text-white transition-colors hover:bg-red-700">
                <Gamepad2 className="h-3.5 w-3.5" />
                Explorar
              </Link>
              <UserMenu email={user.email} full_name={user.full_name} avatar_url={user.avatar_url} />
            </>
          ) : (
            <>
              <Link href="/login"
                className="inline-flex items-center gap-2 border border-white/20 px-5 py-2.5 font-inter text-xs uppercase tracking-widest text-white/70 transition-colors hover:border-white/40 hover:text-white">
                <LogIn className="h-3.5 w-3.5" />
                Entrar
              </Link>
              <Link href="/games"
                className="inline-flex items-center gap-2 bg-red-600 px-5 py-2.5 font-inter text-xs uppercase tracking-widest text-white transition-colors hover:bg-red-700">
                <Gamepad2 className="h-3.5 w-3.5" />
                Explorar
              </Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button type="button" onClick={() => setMenuOpen(true)} aria-label="Abrir menú"
          className="flex flex-col space-y-1.5 md:hidden">
          <div className="h-0.5 w-6 bg-white" />
          <div className="h-0.5 w-6 bg-white" />
          <div className="h-0.5 w-4 bg-white" />
        </button>
      </header>

      {/* Mobile overlay */}
      <div className={`fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm transition-all duration-500 md:hidden ${menuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <span className="font-podium text-2xl font-bold uppercase tracking-wider text-white sm:text-3xl">
            Bos<span className="text-red-600">Store</span>
          </span>
          <button type="button" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú"
            className="text-white/60 transition-colors hover:text-white">
            <X className="h-7 w-7" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col justify-center gap-6 px-6 sm:px-10">
          {user && (
            <div className="mb-2 flex items-center gap-3" style={itemStyle(0)}>
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt=""
                  className="h-11 w-11 rounded-full object-cover ring-1 ring-white/20" />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center bg-red-600 font-podium text-lg uppercase text-white">
                  {(user.full_name || user.email).charAt(0).toUpperCase()}
                </span>
              )}
              <span className="truncate font-inter text-sm text-white/60">
                {user.full_name || user.email}
              </span>
            </div>
          )}

          {NAV_LINKS.map(({ label, href }, i) => (
            <Link key={label} href={href} onClick={() => setMenuOpen(false)}
              className="font-podium text-4xl uppercase text-white transition-colors hover:text-red-500 sm:text-5xl"
              style={itemStyle(i + (user ? 1 : 0))}>
              {label}
            </Link>
          ))}

          <Link href="/games" onClick={() => setMenuOpen(false)}
            className="mt-4 inline-flex w-fit items-center gap-2 bg-red-600 px-6 py-3 font-inter text-xs uppercase tracking-widest text-white transition-colors hover:bg-red-700"
            style={itemStyle(NAV_LINKS.length + (user ? 1 : 0))}>
            <Gamepad2 className="h-4 w-4" />
            Explorar catálogo
          </Link>

          {user ? (
            <LogoutButton
              className="inline-flex w-fit items-center gap-2 border border-white/20 px-6 py-3 font-inter text-xs uppercase tracking-widest text-white/70 transition-colors hover:text-white"
              style={itemStyle(NAV_LINKS.length + 2)}>
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </LogoutButton>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)}
              className="inline-flex w-fit items-center gap-2 border border-white/20 px-6 py-3 font-inter text-xs uppercase tracking-widest text-white/70 transition-colors hover:text-white"
              style={itemStyle(NAV_LINKS.length + 1)}>
              <LogIn className="h-4 w-4" />
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </>
  )
}
