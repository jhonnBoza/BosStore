'use client'

import { useEffect } from 'react'
import { useWishlistStore } from '@/store/wishlist'

/** Carga una vez los slugs de la wishlist del usuario al entrar a la tienda. */
export default function WishlistInit() {
  const load = useWishlistStore((s) => s.load)
  useEffect(() => {
    load()
  }, [load])
  return null
}
