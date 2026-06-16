import { Router } from 'express'
import { auth } from '../../middlewares/auth'
import { requireRole } from '../../middlewares/requireRole'
import * as controller from './uploads.controller'

const router = Router()

// Solo admin puede subir imágenes
router.post('/', auth, requireRole('admin'), controller.uploadImage)

export default router
