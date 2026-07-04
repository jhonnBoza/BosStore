import type { Request, Response, NextFunction } from 'express'
import { listReviewsByGame } from './reviews.service'

export async function getGameReviews(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await listReviewsByGame(req.params.slug)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}
