import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Mini header */}
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4 sm:px-10">
          <Link
            href="/"
            className="font-podium text-xl font-bold uppercase tracking-wider text-white"
          >
            Bos<span className="text-red-600">Store</span>
          </Link>
          <Link
            href="/games"
            className="inline-flex items-center gap-2 font-inter text-[10px] uppercase tracking-widest text-white/40 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a la tienda
          </Link>
        </div>
      </header>
      {children}
    </div>
  )
}
