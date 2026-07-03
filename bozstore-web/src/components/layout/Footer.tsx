import Link from 'next/link'
import Image from 'next/image'

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Tienda',
    links: [
      { label: 'Catálogo', href: '/games' },
      { label: 'Novedades', href: '/novedades' },
      { label: 'Ofertas', href: '/ofertas' },
    ],
  },
  {
    title: 'Cuenta',
    links: [
      { label: 'Iniciar sesión', href: '/login' },
      { label: 'Crear cuenta', href: '/register' },
      { label: 'Mi cuenta', href: '/account' },
    ],
  },
  {
    title: 'Soporte',
    links: [
      { label: 'Centro de ayuda', href: '/soporte' },
      { label: 'Términos de uso', href: '/terminos' },
      { label: 'Privacidad', href: '/privacidad' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-zinc-50 dark:border-white/5 dark:bg-zinc-900/30">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/logo-dark-sf.png"
                alt="BosStore"
                width={48}
                height={48}
                className="hidden object-contain dark:block"
              />
              <Image
                src="/logo-sin-fondo.png"
                alt="BosStore"
                width={48}
                height={48}
                className="block object-contain dark:hidden"
              />
              <span className="font-podium text-2xl uppercase tracking-wider text-zinc-900 dark:text-white">
                Bos<span className="text-red-600">Store</span>
              </span>
            </Link>
            <p className="mt-4 max-w-[220px] font-inter text-sm leading-relaxed text-zinc-400 dark:text-white/30">
              La tienda de videojuegos digitales que estabas buscando. Entrega
              instantánea, los mejores precios.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 lg:col-span-3">
            {COLUMNS.map(({ title, links }) => (
              <div key={title}>
                <h4 className="mb-5 font-podium text-[10px] uppercase tracking-widest text-zinc-400 dark:text-white/20">
                  {title}
                </h4>
                <ul className="space-y-3">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="font-inter text-sm text-zinc-400 transition-colors hover:text-red-500 dark:text-white/30"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-zinc-100 pt-8 dark:border-white/5 sm:flex-row sm:items-center">
          <p className="font-inter text-xs text-zinc-400 dark:text-white/20">
            © 2026 BosStore. Todos los derechos reservados.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            {['PC', 'PlayStation', 'Xbox', 'Nintendo'].map((p) => (
              <span
                key={p}
                className="font-inter text-[9px] uppercase tracking-widest text-zinc-300 dark:text-white/20"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
