import Link from 'next/link'

export default function GameNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="select-none font-podium text-[10rem] uppercase leading-none text-white/5">
        404
      </span>
      <h1 className="mt-4 font-podium text-2xl uppercase tracking-tight text-white">
        Juego no encontrado
      </h1>
      <p className="mt-2 font-inter text-sm text-white/40">
        Este juego no existe o fue eliminado del catálogo.
      </p>
      <Link
        href="/games"
        className="mt-8 border border-white/15 px-6 py-3 font-inter text-[10px] uppercase tracking-widest text-white/60 transition-colors hover:border-red-500 hover:text-red-500"
      >
        Ver catálogo
      </Link>
    </div>
  )
}
