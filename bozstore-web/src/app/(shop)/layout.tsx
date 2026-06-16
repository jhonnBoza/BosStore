import ShopHeader from '@/components/layout/ShopHeader'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import WishlistInit from '@/components/wishlist/WishlistInit'
import { createClient } from '@/lib/supabase/server'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userInfo = user
    ? {
        email: user.email ?? '',
        full_name: (user.user_metadata?.full_name as string | null | undefined) ?? null,
        avatar_url: (user.user_metadata?.avatar_url as string | null | undefined) ?? null,
      }
    : null

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <ShopHeader user={userInfo} />
      <CartDrawer />
      <WishlistInit />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}
