'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import UserMenu from '@/components/auth/UserMenu'
import CartIcon from '@/components/cart/CartIcon'

export type UserInfo = {
  email: string
  full_name?: string | null
  avatar_url?: string | null
} | null

export default function ShopHeader({ user }: { user: UserInfo }) {
  const router = useRouter()

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = (
      (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value ?? ''
    ).trim()
    router.push(q ? `/games?q=${encodeURIComponent(q)}` : '/games')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4 sm:px-10 lg:px-16">
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 font-podium text-xl uppercase tracking-wider text-white"
        >
          Bos<span className="text-red-500">Store</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-xl flex-1">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              name="q"
              placeholder="Buscar juegos..."
              className="w-full border border-white/10 bg-white/5 py-2 pl-10 pr-4 font-inter text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-red-500/40"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1">
          <CartIcon />

          {user ? (
            <UserMenu
              email={user.email}
              full_name={user.full_name}
              avatar_url={user.avatar_url}
            />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="border border-white/15 px-4 py-2 font-inter text-[10px] uppercase tracking-widest text-white/60 transition-colors hover:border-red-500 hover:text-red-500"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="hidden bg-red-600 px-4 py-2 font-inter text-[10px] uppercase tracking-widest text-white transition-colors hover:bg-red-700 sm:inline-block"
              >
                Crear cuenta
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
