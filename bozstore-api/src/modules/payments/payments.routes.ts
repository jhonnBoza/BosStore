import { Router, type Request, type Response, type NextFunction } from 'express'
import { auth } from '../../middlewares/auth'
import {
  createCheckoutSession,
  getCheckoutSession,
  confirmCheckout,
  handleWebhook,
  type CheckoutItem,
} from './payments.service'

const router = Router()

// POST /payments/checkout — crea la sesión de Stripe Checkout y devuelve la URL
router.post(
  '/checkout',
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items } = req.body as { items: CheckoutItem[] }
      const url = await createCheckoutSession(
        items,
        req.user?.email ?? '',
        req.user!.id,
      )
      res.json({ success: true, data: { url } })
    } catch (err) {
      next(err)
    }
  },
)

// POST /payments/confirm — registra la orden tras volver de Stripe (sin webhook)
router.post(
  '/confirm',
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { session_id } = req.body as { session_id: string }
      const result = await confirmCheckout(session_id, req.user!.id)
      res.json({ success: true, data: result })
    } catch (err) {
      next(err)
    }
  },
)

// GET /payments/session/:id — datos de una sesión completada (página de éxito)
router.get(
  '/session/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await getCheckoutSession(req.params.id)
      res.json({ success: true, data: session })
    } catch (err) {
      next(err)
    }
  },
)

// POST /payments/webhook — sin auth, verifica firma con el body crudo (Buffer)
router.post(
  '/webhook',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = req.headers['stripe-signature'] as string
      await handleWebhook(req.body as Buffer, signature)
      res.json({ received: true })
    } catch (err) {
      next(err)
    }
  },
)

export default router
