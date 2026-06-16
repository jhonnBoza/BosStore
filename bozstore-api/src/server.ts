import { env } from './config/env'
import app from './app'

const server = app.listen(env.PORT, () => {
  console.log(`🎮  BozStore API  →  http://localhost:${env.PORT}/api/v1`)
  console.log(`    Environment   →  ${env.NODE_ENV}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...')
  server.close(() => process.exit(0))
})
