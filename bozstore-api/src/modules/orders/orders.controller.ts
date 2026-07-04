import { type Request, type Response, type NextFunction } from 'express'
import * as service from './orders.service'

export async function listMyOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await service.findOrdersByUser(req.user!.id)
    res.json({ success: true, data: orders })
  } catch (err) { next(err) }
}

export async function listAllOrders(_req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await service.findAllOrders()
    res.json({ success: true, data: orders })
  } catch (err) { next(err) }
}

export async function getMyOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await service.findUserOrderById(req.user!.id, req.params.id)
    res.json({ success: true, data: order })
  } catch (err) { next(err) }
}
