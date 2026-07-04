import { type Request, type Response, type NextFunction } from 'express'
import * as service from './games.service'

export async function listGames(req: Request, res: Response, next: NextFunction) {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : undefined

    // limit/offset opcionales — se sanean a enteros no negativos
    const parseIntParam = (v: unknown, min: number, max: number) => {
      const n = typeof v === 'string' ? Number.parseInt(v, 10) : NaN
      return Number.isFinite(n) && n >= min ? Math.min(n, max) : undefined
    }
    const limit  = parseIntParam(req.query.limit, 1, 100)
    const offset = parseIntParam(req.query.offset, 0, 100_000)

    const { games, total } = await service.findAllGames({ q, limit, offset })
    res.json({
      success: true,
      data: games,
      meta: { total, limit: limit ?? null, offset: offset ?? 0 },
    })
  } catch (err) { next(err) }
}

export async function getGame(req: Request, res: Response, next: NextFunction) {
  try {
    const game = await service.findGameBySlug(req.params.slug)
    res.json({ success: true, data: game })
  } catch (err) { next(err) }
}

export async function addGame(req: Request, res: Response, next: NextFunction) {
  try {
    const game = await service.createGame(req.body)
    res.status(201).json({ success: true, data: game })
  } catch (err) { next(err) }
}

export async function editGame(req: Request, res: Response, next: NextFunction) {
  try {
    const game = await service.updateGame(req.params.slug, req.body)
    res.json({ success: true, data: game })
  } catch (err) { next(err) }
}

export async function removeGame(req: Request, res: Response, next: NextFunction) {
  try {
    await service.deleteGame(req.params.slug)
    res.status(204).send()
  } catch (err) { next(err) }
}
