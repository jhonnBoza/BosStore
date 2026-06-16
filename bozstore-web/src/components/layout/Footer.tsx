import Link from 'next/link'
import { Gamepad2 } from 'lucide-react'

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
    <footer className="border-t border-white/5 bg-zinc-900/30">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-podium text-2xl uppercase tracking-wider text-white"
            >
              <Gamepad2 className="h-5 w-5 text-red-600" />
              Bos<span className="text-red-600">Store</span>
            </Link>
            <p className="mt-4 max-w-[220px] font-inter text-sm leading-relaxed text-white/30">
              La tienda de videojuegos digitales que estabas buscando. Entrega
              instantánea, los mejores precios.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 lg:col-span-3">
            {COLUMNS.map(({ title, links }) => (
              <div key={title}>
                <h4 className="mb-5 font-podium text-[10px] uppercase tracking-widest text-white/20">
                  {title}
                </h4>
                <ul className="space-y-3">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="font-inter text-sm text-white/30 transition-colors hover:text-red-500"
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

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row sm:items-center">
          <p className="font-inter text-xs text-white/20">
            © 2026 BosStore. Todos los derechos reservados.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            {['PC', 'PlayStation', 'Xbox', 'Nintendo'].map((p) => (
              <span
                key={p}
                className="font-inter text-[9px] uppercase tracking-widest text-white/20"
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
