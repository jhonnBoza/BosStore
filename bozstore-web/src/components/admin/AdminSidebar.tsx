'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ExternalLink,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
} from 'lucide-react'
import LogoutButton from '@/components/auth/LogoutButton'

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
      <aside className="hidden w-56 shrink-0 flex-col border-r border-white/5 bg-zinc-900 md:flex">
        {/* Logo */}
        <div className="border-b border-white/5 px-5 py-5">
          <Link href="/admin" className="font-podium text-xl uppercase tracking-wider text-white">
            Bos<span className="text-red-500">Store</span>
          </Link>
          <span className="mt-0.5 block font-inter text-[9px] uppercase tracking-[0.2em] text-white/25">
            Administración
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <p className="mb-2 px-3 font-inter text-[8px] uppercase tracking-widest text-white/20">
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
                        ? 'bg-red-600/10 text-red-400'
                        : 'text-white/45 hover:bg-white/5 hover:text-white'
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

          <div className="mt-6 border-t border-white/5 pt-4">
            <p className="mb-2 px-3 font-inter text-[8px] uppercase tracking-widest text-white/20">
              Tienda
            </p>
            <Link
              href="/games"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 font-inter text-xs text-white/45 transition-colors hover:bg-white/5 hover:text-white"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              Ver tienda
            </Link>
          </div>
        </nav>

        {/* User */}
        <div className="border-t border-white/5 px-5 py-4">
          <p className="truncate font-inter text-[10px] text-white/30">{email}</p>
          <LogoutButton
            className="mt-2 flex items-center gap-2 font-inter text-[10px] uppercase tracking-widest text-white/25 transition-colors hover:text-white/50"
          >
            <LogOut className="h-3 w-3" />
            Cerrar sesión
          </LogoutButton>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-white/5 bg-zinc-900 px-5 py-3.5 md:hidden">
        <Link href="/admin" className="font-podium text-lg uppercase tracking-wider text-white">
          Bos<span className="text-red-500">Store</span>
          <span className="ml-2 font-inter text-[9px] uppercase tracking-[0.15em] text-white/30">
            Admin
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`font-inter text-[10px] uppercase tracking-widest transition-colors ${
                pathname.startsWith(href) ? 'text-red-400' : 'text-white/40 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  )
}
