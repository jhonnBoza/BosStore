import { Router } from 'express'
import * as controller from './ai.controller'

const router = Router()

// POST /api/v1/ai/chat — asistente del catálogo (público)
router.post('/chat', controller.chat)

export default router
