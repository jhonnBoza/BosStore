import { z } from 'zod'

export const GameSchema = z.object({
  title:            z.string().min(1).max(200),
  slug:             z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'solo minúsculas, números y guiones'),
  description:      z.string().max(2000).optional(),
  price:            z.number().positive(),
  cover_url:        z.string().url().optional(),
  banner_url:       z.string().url().optional(),
  genre:            z.string().max(100).optional(),
  platform:         z.string().max(100).optional(),
  stock:            z.coerce.number().int().min(0).default(0),
  discount_percent: z.coerce.number().int().min(0).max(95).default(0),
  trailer_url:      z.string().url().optional(),
  screenshots:      z.array(z.string().url()).optional(),
  release_date:     z.string().optional(),
  developer:        z.string().max(150).optional(),
})

export type GameInput = z.infer<typeof GameSchema>
