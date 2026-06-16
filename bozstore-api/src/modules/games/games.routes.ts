import { Router } from 'express'
import { auth } from '../../middlewares/auth'
import { requireRole } from '../../middlewares/requireRole'
import { validate } from '../../middlewares/validate'
import { GameSchema } from './games.schema'
import * as controller from './games.controller'

const router = Router()

// Público: cualquier visitante puede ver el catálogo
router.get('/',      controller.listGames)
router.get('/:slug', controller.getGame)

// Solo admin: gestión del catálogo
router.post(  '/',      auth, requireRole('admin'), validate(GameSchema),           controller.addGame)
router.patch( '/:slug', auth, requireRole('admin'), validate(GameSchema.partial()), controller.editGame)
router.delete('/:slug', auth, requireRole('admin'),                                 controller.removeGame)

export default router
