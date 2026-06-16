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
}

export default nextConfig
