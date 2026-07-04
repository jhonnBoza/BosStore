import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // El admin puede pegar portadas/banners desde cualquier web, así que
    // permitimos cualquier host HTTPS. (http queda fuera por seguridad.)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Tree-shaking agresivo de librerías de iconos → menos JS, navegación más rápida.
  experimental: {
    optimizePackageImports: ['lucide-react', '@fortawesome/react-fontawesome'],
  },
  poweredByHeader: false,
  compress: true,
}

export default nextConfig
