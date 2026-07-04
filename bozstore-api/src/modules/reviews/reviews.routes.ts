import { Router } from 'express'
import * as controller from './reviews.controller'

const router = Router()

// GET /api/v1/reviews/:slug — reseñas públicas de un juego
router.get('/:slug', controller.getGameReviews)

export default router
