import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

type WishlistStore = {
  slugs: Set<string>
  loaded: boolean
  load: () => Promise<void>
  toggle: (slug: string) => Promise<void>
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  slugs: new Set<string>(),
  loaded: false,

  load: async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      set({ slugs: new Set(), loaded: true })
      return
    }
    const { data } = await supabase.from('wishlists').select('game_slug')
    set({
      slugs: new Set((data ?? []).map((r) => r.game_slug as string)),
      loaded: true,
    })
  },

  toggle: async (slug: string) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const next = encodeURIComponent(window.location.pathname)
      window.location.href = `/login?next=${next}`
      return
    }

    const slugs = new Set(get().slugs)
    if (slugs.has(slug)) {
      slugs.delete(slug)
      set({ slugs })
      await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('game_slug', slug)
    } else {
      slugs.add(slug)
      set({ slugs })
      await supabase
        .from('wishlists')
        .insert({ user_id: user.id, game_slug: slug })
    }
  },
}))
