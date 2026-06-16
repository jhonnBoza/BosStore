import { type Request, type Response, type NextFunction } from 'express'
import * as service from './auth.service'

export async function requestRegister(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, full_name } = req.body
    await service.requestOtp(email, password, full_name ?? '')
    res.json({ success: true })
  } catch (err) { next(err) }
}

export async function verifyRegister(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, code } = req.body
    await service.verifyOtp(email, code)
    res.status(201).json({ success: true })
  } catch (err) { next(err) }
}
