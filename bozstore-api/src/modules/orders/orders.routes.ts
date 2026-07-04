import { Router } from 'express'
import { auth } from '../../middlewares/auth'
import { requireRole } from '../../middlewares/requireRole'
import * as controller from './orders.controller'

const router = Router()

// Todas las rutas de órdenes requieren sesión
router.use(auth)

// GET /orders — órdenes del usuario autenticado (con sus ítems)
router.get('/', controller.listMyOrders)

// GET /orders/all — todas las órdenes de la tienda (solo admin).
// Debe declararse ANTES de /:id para que "all" no se capture como id.
router.get('/all', requireRole('admin'), controller.listAllOrders)

// GET /orders/:id — detalle de una orden propia
router.get('/:id', controller.getMyOrder)

// Nota: las órdenes NO se crean aquí. Se registran server-side en el flujo
// de pago (payments.service → recordOrderFromSession) tras confirmar con
// Stripe que la sesión está pagada.

export default router
