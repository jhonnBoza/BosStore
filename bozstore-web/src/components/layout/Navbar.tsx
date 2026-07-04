'use client'

import { useState, useEffect, useRef, type CSSProperties } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Gamepad2, LogIn, LogOut, Search, X } from 'lucide-react'
import UserMenu from '@/components/auth/UserMenu'
import LogoutButton from '@/components/auth/LogoutButton'
import ThemeToggle from '@/components/ui/ThemeToggle'
import CartIcon from '@/components/cart/CartIcon'

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
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrollState, setScrollState] = useState<'top' | 'hero' | 'body'>('top')
  const [navHidden, setNavHidden] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const lastScrollY = useRef(0)
  const router    = useRouter()

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

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = (searchRef.current?.value ?? '').trim()
    router.push(q ? `/games?q=${encodeURIComponent(q)}` : '/games')
    setSearchOpen(false)
    if (searchRef.current) searchRef.current.value = ''
  }

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
        navHidden && !menuOpen && !searchOpen ? '-translate-y-full' : 'translate-y-0'
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
        <div className="hidden items-center gap-2 md:flex">
          {/* Búsqueda expandible */}
          {showSearch && (
            <div className="relative flex items-center">
              <form
                onSubmit={handleSearch}
                className={`flex items-center overflow-hidden transition-all duration-300 ${
                  searchOpen ? 'w-52' : 'w-0'
                }`}
              >
                <input
                  ref={searchRef}
                  name="q"
                  type="text"
                  placeholder="Buscar juegos..."
                  onBlur={() => {
                    if (!searchRef.current?.value) setSearchOpen(false)
                  }}
                  className="w-full border-b border-zinc-300 bg-transparent py-1 pr-2 font-inter text-sm text-zinc-900 placeholder-zinc-400 outline-none dark:border-white/20 dark:text-white dark:placeholder-white/30"
                />
              </form>
              <button
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                className="flex h-8 w-8 items-center justify-center text-zinc-500 transition-colors hover:text-zinc-900 dark:text-white/60 dark:hover:text-white"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          )}

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
          {showSearch && (
            <button type="button" onClick={() => setSearchOpen((v) => !v)}
              className="text-zinc-500 dark:text-white/60">
              <Search className="h-5 w-5" />
            </button>
          )}
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

      {/* Barra de búsqueda móvil expandida */}
      {showSearch && searchOpen && (
        <div className="fixed inset-x-0 top-[73px] z-39 border-b border-zinc-200 bg-white/95 px-6 py-3 backdrop-blur-md dark:border-white/10 dark:bg-zinc-950/95 md:hidden">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Search className="h-4 w-4 shrink-0 text-zinc-400 dark:text-white/30" />
            <input
              ref={searchRef}
              name="q"
              type="text"
              placeholder="Buscar juegos..."
              autoFocus
              className="flex-1 bg-transparent font-inter text-sm text-zinc-900 placeholder-zinc-400 outline-none dark:text-white dark:placeholder-white/30"
            />
            <button type="button" onClick={() => setSearchOpen(false)}>
              <X className="h-4 w-4 text-zinc-400 dark:text-white/30" />
            </button>
          </form>
        </div>
      )}

      {/* Mobile overlay */}
      <div className={`fixed inset-0 z-50 flex flex-col bg-white/98 backdrop-blur-sm dark:bg-black/95 transition-all duration-500 md:hidden ${menuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <BrandLogo />
          <button type="button" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú"
            className="text-zinc-400 transition-colors hover:text-zinc-900 dark:text-white/60 dark:hover:text-white">
            <X className="h-7 w-7" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col justify-center gap-6 px-6 sm:px-10">
          {user && (
            <div className="mb-2 flex items-center gap-3" style={itemStyle(0)}>
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt=""
                  className="h-11 w-11 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-white/20" />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center bg-red-600 font-podium text-lg uppercase text-white">
                  {(user.full_name || user.email).charAt(0).toUpperCase()}
                </span>
              )}
              <span className="truncate font-inter text-sm text-zinc-500 dark:text-white/60">
                {user.full_name || user.email}
              </span>
            </div>
          )}

          {NAV_LINKS.map(({ label, href }, i) => (
            <Link key={label} href={href} onClick={() => setMenuOpen(false)}
              className="font-podium text-4xl uppercase text-zinc-900 transition-colors hover:text-red-500 dark:text-white sm:text-5xl"
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
              className="inline-flex w-fit items-center gap-2 border border-zinc-200 px-6 py-3 font-inter text-xs uppercase tracking-widest text-zinc-500 transition-colors hover:text-zinc-900 dark:border-white/20 dark:text-white/70 dark:hover:text-white"
              style={itemStyle(NAV_LINKS.length + 2)}>
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </LogoutButton>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)}
              className="inline-flex w-fit items-center gap-2 border border-zinc-200 px-6 py-3 font-inter text-xs uppercase tracking-widest text-zinc-500 transition-colors hover:text-zinc-900 dark:border-white/20 dark:text-white/70 dark:hover:text-white"
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
