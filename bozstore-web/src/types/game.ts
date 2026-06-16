export interface Game {
  id: string
  title: string
  slug: string
  description?: string
  price: number
  cover_url?: string
  banner_url?: string
  genre?: string
  platform?: string
  stock: number
  created_at: string
  discount_percent?: number
  trailer_url?: string
  screenshots?: string[]
  release_date?: string
  developer?: string
}
