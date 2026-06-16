import Link from 'next/link'
import { ArrowLeft, Gamepad2 } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 px-6 text-center text-white">
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-red-600/10 blur-[140px]" />
      </div>

      <div className="relative">
        <span className="select-none font-podium text-[9rem] uppercase leading-none text-white/5 sm:text-[12rem]">
          404
        </span>
        <h1 className="mt-2 font-podium text-3xl uppercase tracking-tight text-white sm:text-4xl">
          Página no encontrada
        </h1>
        <p className="mx-auto mt-3 max-w-sm font-inter text-sm leading-relaxed text-white/40">
          La página que buscas no existe, cambió de lugar o nunca estuvo aquí.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-red-600 px-6 py-3 font-inter text-[11px] uppercase tracking-widest text-white transition-colors hover:bg-red-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <Link
            href="/games"
            className="inline-flex items-center gap-2 border border-white/15 px-6 py-3 font-inter text-[11px] uppercase tracking-widest text-white/60 transition-colors hover:border-red-500 hover:text-white"
          >
            <Gamepad2 className="h-4 w-4" />
            Ver catálogo
          </Link>
        </div>
      </div>
    </div>
  )
}
