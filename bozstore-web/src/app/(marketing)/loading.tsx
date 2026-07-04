/**
 * Pantalla de carga del landing.
 *
 * Al volver a la página de inicio (que es dinámica: carga juegos y sesión en
 * el servidor), Next.js mostraría la pantalla ANTERIOR durante el render.
 * Con este loading boundary se muestra al instante un fondo oscuro con el
 * logo, así la transición es limpia (oscuro → video) sin el "flash" feo.
 */
export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-5">
        <span className="animate-pulse font-podium text-5xl uppercase tracking-wider text-zinc-900 dark:text-white sm:text-6xl">
          Bos<span className="text-red-600">Store</span>
        </span>
        <span className="font-inter text-[10px] uppercase tracking-[0.3em] text-zinc-400 dark:text-white/40">
          Cargando…
        </span>
      </div>
    </div>
  )
}
