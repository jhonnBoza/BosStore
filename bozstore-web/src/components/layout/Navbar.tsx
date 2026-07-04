'use client'

import { useState, useEffect, useRef, type CSSProperties } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Gamepad2, LayoutDashboard, LogIn, LogOut, User, X } from 'lucide-react'
import UserMenu from '@/components/auth/UserMenu'
import LogoutButton from '@/components/auth/LogoutButton'
import ThemeToggle from '@/components/ui/ThemeToggle'
import CartIcon from '@/components/cart/CartIcon'
import SearchBox from '@/components/shop/SearchBox'

export type NavUser = {
  email: string
  full_name?: string | null
  avatar_url?: string | null
  isAdmin?: boolean
} | null

const NAV_LINKS = [
  { label: 'Catálogo',  href: '/games'     },
  { label: 'Novedades', href: '/novedades' },
  { label: 'Ofertas',   href: '/ofertas'   },
] as const

function BrandLogo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5">
      <Image
        src="/logo-dark-sf.png"
        alt="BosStore"
        width={40}
        height={40}
        className="hidden object-contain dark:block"
        priority
      />
      <Image
        src="/logo-sin-fondo.png"
        alt="BosStore"
        width={40}
        height={40}
        className="block object-contain dark:hidden"
        priority
      />
      <span className="font-podium text-2xl font-bold uppercase tracking-wider text-zinc-900 dark:text-white sm:text-3xl">
        Bos<span className="text-red-600 [-webkit-text-stroke:0.3px_black] dark:[-webkit-text-stroke:0px]">Store</span>
      </span>
    </Link>
  )
}

export default function Navbar({
  user = null,
  showSearch = false,
  showCart = false,
}: {
  user?: NavUser
  showSearch?: boolean
  showCart?: boolean
}) {
  const [menuOpen, setMenuOpen]     = useState(false)
  const [scrollState, setScrollState] = useState<'top' | 'hero' | 'body'>('top')
  const [navHidden, setNavHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y === 0) setScrollState('top')
      else if (y < window.innerHeight - 80) setScrollState('hero')
      else setScrollState('body')

      const scrollingDown = y > lastScrollY.current
      setNavHidden(scrollingDown && y > 110)
      lastScrollY.current = Math.max(y, 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const itemStyle = (i: number): CSSProperties => ({
    transitionProperty: 'opacity, transform',
    transitionDuration: '500ms',
    transitionDelay: `${i * 80 + 100}ms`,
    opacity: menuOpen ? 1 : 0,
    transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
  })

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 transition-all duration-300 sm:px-10 lg:px-16 lg:py-7 ${
        navHidden && !menuOpen ? '-translate-y-full' : 'translate-y-0'
      } ${
        scrollState === 'body'
          ? 'border-b border-zinc-200/80 bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-zinc-950/95'
          : scrollState === 'hero'
          ? 'border-b border-transparent bg-white/10 backdrop-blur-sm dark:bg-black/10'
          : 'border-b border-transparent bg-transparent'
      }`}>
        <BrandLogo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex lg:gap-10">
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={label} href={href}
              className="font-inter text-sm uppercase tracking-widest text-zinc-900 transition-colors hover:text-red-600 dark:text-white/70 dark:hover:text-white">
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          {showSearch && <SearchBox className="w-52 lg:w-60" />}

          <ThemeToggle />
          {showCart && <CartIcon />}

          {user ? (
            <>
              <Link href="/games"
                className="inline-flex items-center gap-2 bg-red-600 px-5 py-2.5 font-inter text-xs uppercase tracking-widest text-white transition-colors hover:bg-red-700">
                <Gamepad2 className="h-3.5 w-3.5" />
                Explorar
              </Link>
              <UserMenu email={user.email} full_name={user.full_name} avatar_url={user.avatar_url} isAdmin={user.isAdmin} />
            </>
          ) : (
            <>
              <Link href="/login"
                className="inline-flex items-center gap-2 border border-zinc-200 px-5 py-2.5 font-inter text-xs uppercase tracking-widest text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-white/20 dark:text-white/70 dark:hover:border-white/40 dark:hover:text-white">
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
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          {showCart && <CartIcon />}
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Abrir menú"
            className="flex flex-col space-y-1.5">
            <div className="h-0.5 w-6 bg-zinc-900 dark:bg-white" />
            <div className="h-0.5 w-6 bg-zinc-900 dark:bg-white" />
            <div className="h-0.5 w-4 bg-zinc-900 dark:bg-white" />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div className={`fixed inset-0 z-50 flex flex-col bg-white/98 backdrop-blur-sm dark:bg-black/95 transition-all duration-500 md:hidden ${menuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <BrandLogo />
          <button type="button" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú"
            className="text-zinc-400 transition-colors hover:text-zinc-900 dark:text-white/60 dark:hover:text-white">
            <X className="h-7 w-7" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col justify-center gap-6 overflow-y-auto px-6 py-6 sm:px-10">
          {(() => {
            let i = -1
            const next = () => { i += 1; return i }
            return (
              <>
                {user && (
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="mb-2 flex items-center gap-3"
                    style={itemStyle(next())}
                  >
                    {user.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar_url} alt=""
                        className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-white/20" />
                    ) : (
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-red-600 font-podium text-lg uppercase text-white">
                        {(user.full_name || user.email).charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate font-inter text-sm text-zinc-900 dark:text-white">
                        {user.full_name || user.email}
                      </span>
                      <span className="block font-inter text-[10px] uppercase tracking-widest text-zinc-400 dark:text-white/40">
                        Ver mi cuenta
                      </span>
                    </span>
                  </Link>
                )}

                {showSearch && (
                  <div className="mb-2" style={itemStyle(next())}>
                    <SearchBox onNavigate={() => setMenuOpen(false)} />
                  </div>
                )}

                {NAV_LINKS.map(({ label, href }) => (
                  <Link key={label} href={href} onClick={() => setMenuOpen(false)}
                    className="font-podium text-4xl uppercase text-zinc-900 transition-colors hover:text-red-500 dark:text-white sm:text-5xl"
                    style={itemStyle(next())}>
                    {label}
                  </Link>
                ))}

                {user && (
                  <Link href="/account" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 font-podium text-4xl uppercase text-zinc-900 transition-colors hover:text-red-500 dark:text-white sm:text-5xl"
                    style={itemStyle(next())}>
                    <User className="h-6 w-6 shrink-0 text-red-600" />
                    Mi cuenta
                  </Link>
                )}

                {user?.isAdmin && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 font-podium text-4xl uppercase text-red-600 transition-colors hover:text-red-500 sm:text-5xl"
                    style={itemStyle(next())}>
                    <LayoutDashboard className="h-6 w-6 shrink-0" />
                    Admin
                  </Link>
                )}

                <Link href="/games" onClick={() => setMenuOpen(false)}
                  className="mt-4 inline-flex w-fit items-center gap-2 bg-red-600 px-6 py-3 font-inter text-xs uppercase tracking-widest text-white transition-colors hover:bg-red-700"
                  style={itemStyle(next())}>
                  <Gamepad2 className="h-4 w-4" />
                  Explorar catálogo
                </Link>

                {user ? (
                  <LogoutButton
                    className="inline-flex w-fit items-center gap-2 border border-zinc-200 px-6 py-3 font-inter text-xs uppercase tracking-widest text-zinc-500 transition-colors hover:text-zinc-900 dark:border-white/20 dark:text-white/70 dark:hover:text-white"
                    style={itemStyle(next())}>
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </LogoutButton>
                ) : (
                  <Link href="/login" onClick={() => setMenuOpen(false)}
                    className="inline-flex w-fit items-center gap-2 border border-zinc-200 px-6 py-3 font-inter text-xs uppercase tracking-widest text-zinc-500 transition-colors hover:text-zinc-900 dark:border-white/20 dark:text-white/70 dark:hover:text-white"
                    style={itemStyle(next())}>
                    <LogIn className="h-4 w-4" />
                    Iniciar sesión
                  </Link>
                )}
              </>
            )
          })()}
        </nav>
      </div>
    </>
  )
}
