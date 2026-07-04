'use client'

import { useEffect } from 'react'

/**
 * Aplica una aparición fluida (fade + slide) a todos los elementos con el
 * atributo `data-reveal` cuando entran en el viewport.
 *
 * Usa IntersectionObserver (sin listeners de scroll → sin jank) y respeta
 * la preferencia de "menos movimiento". Es un componente cliente que no
 * pinta nada: solo activa el efecto y se limpia al desmontar.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]'),
    )
    if (els.length === 0) return

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    // Sin animación si el usuario lo prefiere o el navegador no soporta IO.
    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('reveal-in'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-in')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    )

    els.forEach((el) => io.observe(el))

    // Red de seguridad: si algo falla, muestra todo tras 2.5s.
    const fallback = window.setTimeout(() => {
      els.forEach((el) => el.classList.add('reveal-in'))
    }, 2500)

    return () => {
      io.disconnect()
      window.clearTimeout(fallback)
    }
  }, [])

  return null
}
