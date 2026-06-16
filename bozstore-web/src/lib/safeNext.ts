/**
 * Sanitiza un parámetro `next` de redirección para evitar open redirects.
 * Solo permite rutas internas absolutas (que empiezan con "/").
 */
export function safeNext(next?: string | null): string {
  if (!next) return '/'
  if (
    next.startsWith('/') &&
    !next.startsWith('//') &&
    !next.includes('\\') &&
    !next.includes('://')
  ) {
    return next
  }
  return '/'
}
