import { Router } from 'express'
import { validate } from '../../middlewares/validate'
import { RequestOtpSchema, VerifyOtpSchema } from './auth.schema'
import * as controller from './auth.controller'

const router = Router()

// Registro con código por correo (envío propio vía SMTP del API, sin depender
// del correo de Supabase). El mismo endpoint sirve para reenviar el código.
router.post('/register/request', validate(RequestOtpSchema), controller.requestRegister)
router.post('/register/verify',  validate(VerifyOtpSchema),  controller.verifyRegister)

export default router
