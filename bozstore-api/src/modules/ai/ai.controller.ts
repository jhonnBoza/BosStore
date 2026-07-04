import type { Request, Response, NextFunction } from 'express'
import { askAssistant } from './ai.service'

type ChatTurn = { role: 'user' | 'model'; text: string }

export async function chat(req: Request, res: Response, next: NextFunction) {
  try {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : ''
    if (!message) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Escribe una pregunta.' },
      })
      return
    }
    if (message.length > 500) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'La pregunta es demasiado larga (máx. 500 caracteres).' },
      })
      return
    }

    const history: ChatTurn[] = Array.isArray(req.body?.history)
      ? req.body.history
          .filter(
            (t: unknown): t is ChatTurn =>
              !!t &&
              typeof t === 'object' &&
              (('role' in t && (t as ChatTurn).role === 'user') || (t as ChatTurn).role === 'model') &&
              typeof (t as ChatTurn).text === 'string',
          )
          .slice(-8)
      : []

    const answer = await askAssistant(message, history)
    res.json({ success: true, data: { answer } })
  } catch (err) {
    next(err)
  }
}
