'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  ExternalLink,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
} from 'lucide-react'
import LogoutButton from '@/components/auth/LogoutButton'
import ThemeToggle from '@/components/ui/ThemeToggle'

const NAV = [
  { href: '/admin',        label: 'Dashboard', icon: LayoutDashboard, exact: true  },
  { href: '/admin/games',  label: 'Juegos',    icon: Gamepad2,        exact: false },
  { href: '/admin/orders', label: 'Pedidos',   icon: ShoppingBag,     exact: false },
]

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-white/5 dark:bg-zinc-900 md:flex">
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-white/5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image src="/logo-dark-sf.png" alt="BosStore" width={32} height={32}
              className="hidden object-contain dark:block" />
            <Image src="/logo-sin-fondo.png" alt="BosStore" width={32} height={32}
              className="block object-contain dark:hidden" />
            <div>
              <span className="font-podium text-lg uppercase tracking-wider text-zinc-900 dark:text-white">
                Bos<span className="text-red-500">Store</span>
              </span>
              <span className="block font-inter text-[9px] uppercase tracking-[0.2em] text-zinc-400 dark:text-white/25">
                Administración
              </span>
            </div>
          </Link>
          <ThemeToggle />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <p className="mb-2 px-3 font-inter text-[8px] uppercase tracking-widest text-zinc-400 dark:text-white/20">
            General
          </p>
          <ul className="space-y-0.5">
            {NAV.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 font-inter text-xs transition-colors ${
                      active
                        ? 'bg-red-50 text-red-600 dark:bg-red-600/10 dark:text-red-400'
                        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-white/45 dark:hover:bg-white/5 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-red-500" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-white/5">
            <p className="mb-2 px-3 font-inter text-[8px] uppercase tracking-widest text-zinc-400 dark:text-white/20">
              Tienda
            </p>
            <Link
              href="/games"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 font-inter text-xs text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-white/45 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              Ver tienda
            </Link>
          </div>
        </nav>

        {/* User */}
        <div className="border-t border-zinc-200 px-5 py-4 dark:border-white/5">
          <p className="truncate font-inter text-[10px] text-zinc-400 dark:text-white/30">{email}</p>
          <LogoutButton
            className="mt-2 flex items-center gap-2 font-inter text-[10px] uppercase tracking-widest text-zinc-400 transition-colors hover:text-zinc-900 dark:text-white/25 dark:hover:text-white/50"
          >
            <LogOut className="h-3 w-3" />
            Cerrar sesión
          </LogoutButton>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-5 py-3.5 dark:border-white/5 dark:bg-zinc-900 md:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/logo-dark-sf.png" alt="BosStore" width={28} height={28}
            className="hidden object-contain dark:block" />
          <Image src="/logo-sin-fondo.png" alt="BosStore" width={28} height={28}
            className="block object-contain dark:hidden" />
          <span className="font-podium text-lg uppercase tracking-wider text-zinc-900 dark:text-white">
            Bos<span className="text-red-500">Store</span>
          </span>
          <span className="font-inter text-[9px] uppercase tracking-[0.15em] text-zinc-400 dark:text-white/30">
            Admin
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <nav className="flex items-center gap-4">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`font-inter text-[10px] uppercase tracking-widest transition-colors ${
                  pathname.startsWith(href) ? 'text-red-500' : 'text-zinc-400 hover:text-zinc-900 dark:text-white/40 dark:hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  )
}
