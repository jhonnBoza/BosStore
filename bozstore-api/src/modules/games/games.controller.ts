import { type Request, type Response, type NextFunction } from 'express'
import * as service from './games.service'

export async function listGames(_req: Request, res: Response, next: NextFunction) {
  try {
    const games = await service.findAllGames()
    res.json({ success: true, data: games })
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
