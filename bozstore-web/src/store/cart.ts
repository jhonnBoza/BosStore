import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  id: string
  slug: string
  title: string
  price: number
  cover_url?: string | null
  quantity: number
}

type CartStore = {
  items: CartItem[]
  isOpen: boolean
  /** Última modificación del carrito (ms epoch) — usada para expirarlo. */
  updatedAt: number
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

/** Tiempo máximo de permanencia del carrito guardado: 7 días. */
const CART_TTL_MS = 7 * 24 * 60 * 60 * 1000

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      updatedAt: Date.now(),

      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id)
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
            ),
            isOpen: true,
            updatedAt: Date.now(),
          }))
        } else {
          set((state) => ({
            items: [...state.items, { ...item, quantity: 1 }],
            isOpen: true,
            updatedAt: Date.now(),
          }))
        }
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
          updatedAt: Date.now(),
        })),

      updateQuantity: (id, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) =>
                  i.id === id ? { ...i, quantity: qty } : i,
                ),
          updatedAt: Date.now(),
        })),

      clearCart: () => set({ items: [], updatedAt: Date.now() }),
      openCart:  () => set({ isOpen: true  }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'BosStores-cart',
      // Permanencia con tiempo máximo: si el carrito guardado tiene más de
      // 7 días sin cambios, se vacía al rehidratar desde localStorage.
      onRehydrateStorage: () => (state) => {
        if (
          state &&
          state.items.length > 0 &&
          Date.now() - (state.updatedAt ?? 0) > CART_TTL_MS
        ) {
          state.clearCart()
        }
      },
    },
  ),
)

export const cartTotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0)

export const cartCount = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.quantity, 0)

/**
 * Indica si el store persistido ya se rehidrató desde localStorage.
 * Evita mismatches de hidratación SSR: hasta que sea `true`, los
 * consumidores deben tratar el carrito como vacío para coincidir con el HTML del servidor.
 */
export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    setHydrated(useCartStore.persist.hasHydrated())
    const unsub = useCartStore.persist.onFinishHydration(() => setHydrated(true))
    return unsub
  }, [])
  return hydrated
}

