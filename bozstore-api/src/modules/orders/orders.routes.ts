import { Router, type Request, type Response } from 'express'
import { auth } from '../../middlewares/auth'

const router = Router()

// Todas las rutas de órdenes requieren sesión
router.use(auth)

// GET /orders — listar órdenes del usuario autenticado
router.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: [] })
})

// POST /orders — crear una orden (checkout flow)
router.post('/', (_req: Request, res: Response) => {
  res.status(201).json({ success: true, data: {} })
})

export default router
