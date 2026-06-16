import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Footer from '@/components/layout/Footer'

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4 sm:px-10">
          <Link
            href="/"
            className="font-podium text-xl uppercase tracking-wider text-white"
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

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  )
}
