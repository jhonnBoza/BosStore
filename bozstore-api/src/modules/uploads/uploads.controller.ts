import { type Request, type Response, type NextFunction } from 'express'
import { supabaseAdmin } from '../../config/supabase'
import { AppError } from '../../lib/errors'

const BUCKET = 'game-images'
const ALLOWED_FOLDERS = new Set(['covers', 'banners', 'screenshots'])
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

/**
 * Sube una imagen al bucket de Storage usando la clave de servicio
 * (ignora las políticas RLS). Recibe el archivo como data URL base64:
 *   { file: "data:image/png;base64,....", filename: "x.png", folder: "covers" }
 * Devuelve { data: { url } } con la URL pública.
 */
export async function uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    const { file, filename, folder } = req.body as {
      file?: string
      filename?: string
      folder?: string
    }

    if (!file || typeof file !== 'string') {
      throw new AppError(400, 'Falta el archivo.', 'NO_FILE')
    }

    const safeFolder = ALLOWED_FOLDERS.has(folder ?? '') ? (folder as string) : 'misc'

    // file llega como data URL ("data:image/png;base64,XXXX") o base64 puro
    const match = /^data:(.+);base64,(.*)$/s.exec(file)
    const mime = match ? match[1] : 'image/jpeg'
    const b64 = match ? match[2] : file

    if (!mime.startsWith('image/')) {
      throw new AppError(400, 'Solo se permiten imágenes.', 'INVALID_TYPE')
    }

    const buffer = Buffer.from(b64, 'base64')
    if (buffer.byteLength === 0) {
      throw new AppError(400, 'El archivo está vacío o es inválido.', 'EMPTY_FILE')
    }
    if (buffer.byteLength > MAX_BYTES) {
      throw new AppError(413, 'La imagen supera el máximo de 5 MB.', 'TOO_LARGE')
    }

    const ext = (filename?.split('.').pop() || mime.split('/')[1] || 'jpg')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
    const rand = Math.random().toString(36).slice(2, 8)
    const path = `${safeFolder}/${Date.now()}-${rand}.${ext}`

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: mime, upsert: true })

    if (error) {
      throw new AppError(
        500,
        `No se pudo subir al bucket "${BUCKET}": ${error.message}`,
        'UPLOAD_FAILED',
      )
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path)
    res.status(201).json({ success: true, data: { url: data.publicUrl } })
  } catch (err) {
    next(err)
  }
}
