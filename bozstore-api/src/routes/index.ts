import { Router, type Request, type Response } from 'express'
import authRouter     from '../modules/auth/auth.routes'
import gamesRouter    from '../modules/games/games.routes'
import ordersRouter   from '../modules/orders/orders.routes'
import paymentsRouter from '../modules/payments/payments.routes'
import uploadsRouter  from '../modules/uploads/uploads.routes'

const router = Router()

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' })
})

router.use('/auth',     authRouter)
router.use('/games',    gamesRouter)
router.use('/orders',   ordersRouter)
router.use('/payments', paymentsRouter)
router.use('/uploads',  uploadsRouter)

export default router
