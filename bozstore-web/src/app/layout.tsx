import type { Metadata } from 'next'
import { Inter, Bebas_Neue } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'BosStore — Videojuegos',
    template: '%s | BosStore',
  },
  description: 'Compra videojuegos digitales al instante. Los mejores títulos de PC con entrega inmediata y los precios más competitivos.',
  keywords: ['videojuegos', 'juegos digitales', 'PC games', 'comprar juegos', 'tienda gaming'],
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    siteName: 'BosStore',
    title: 'BosStore — Tu tienda de videojuegos digitales',
    description: 'Compra videojuegos digitales al instante. Los mejores títulos de PC con entrega inmediata.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BosStore — Videojuegos Digitales',
    description: 'Compra videojuegos digitales al instante. Los mejores títulos de PC.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${bebasNeue.variable}`} suppressHydrationWarning>
      <head>
        {/* Runs before React hydration — sets dark/light class without flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('bos-theme'),d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='light'||(!t&&!d)){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}})()` }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
