import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env'
import router from './routes'
import { errorHandler } from './middlewares/errorHandler'

const app = express()

// Seguridad
app.use(helmet())
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))

// Logging
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// Body parsing
// El webhook de Stripe necesita el body CRUDO para verificar la firma,
// así que lo excluimos del parser JSON y le aplicamos express.raw().
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/payments/webhook') {
    express.raw({ type: 'application/json' })(req, res, next)
  } else {
    // Límite alto para aceptar imágenes en base64 (subida de portadas/banners)
    express.json({ limit: '12mb' })(req, res, next)
  }
})
app.use(express.urlencoded({ extended: true, limit: '12mb' }))

// Rutas bajo /api/v1
app.use('/api/v1', router)

// 404 — debe ir después de todas las rutas
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
  })
})

// Manejador de errores centralizado — debe ser el ÚLTIMO middleware
app.use(errorHandler)

export default app
