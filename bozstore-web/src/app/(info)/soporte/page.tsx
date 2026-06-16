import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, MessageCircle, ShieldCheck, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Soporte — BosStore',
  description: 'Centro de ayuda y preguntas frecuentes de BosStore.',
}

const FAQ: { q: string; a: string }[] = [
  {
    q: '¿Cómo recibo mi juego después de comprarlo?',
    a: 'La entrega es digital e instantánea. En cuanto se confirma tu pago, el juego aparece en tu biblioteca, dentro de tu cuenta, listo para descargar.',
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Aceptamos tarjetas Visa, Mastercard y American Express, además de PayPal. Todos los pagos se procesan de forma segura mediante Stripe.',
  },
  {
    q: '¿Necesito una cuenta para comprar?',
    a: 'Sí. Crear una cuenta nos permite guardar tu biblioteca y tu historial de compras. Puedes registrarte con tu correo (te enviamos un código de verificación) o con Google.',
  },
  {
    q: 'No me llegó el código de verificación, ¿qué hago?',
    a: 'Revisa tu carpeta de spam. Si aún no lo ves, en la pantalla de verificación puedes pulsar “Reenviar código”. El código tiene una validez limitada por seguridad.',
  },
  {
    q: '¿Puedo pedir un reembolso?',
    a: 'Los reembolsos se evalúan caso por caso debido a que los productos son digitales. Escríbenos dentro de las 48 horas posteriores a tu compra y te ayudaremos.',
  },
  {
    q: 'Olvidé mi contraseña, ¿cómo la recupero?',
    a: 'En la pantalla de inicio de sesión pulsa “¿Olvidaste tu contraseña?”. Te enviaremos un enlace a tu correo para crear una nueva.',
  },
]

const HIGHLIGHTS = [
  { icon: Zap, title: 'Entrega instantánea', desc: 'Tus juegos disponibles al instante tras pagar.' },
  { icon: ShieldCheck, title: 'Compra protegida', desc: 'Pagos cifrados procesados por Stripe.' },
  { icon: MessageCircle, title: 'Soporte cercano', desc: 'Te respondemos lo antes posible.' },
]

export default function SoportePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
      <p className="mb-2 font-inter text-[10px] uppercase tracking-[0.25em] text-red-500">
        Centro de ayuda
      </p>
      <h1 className="font-podium text-4xl uppercase tracking-tight text-white sm:text-5xl">
        Soporte
      </h1>
      <p className="mt-3 max-w-xl font-inter text-sm leading-relaxed text-white/40">
        ¿Tienes una duda? Aquí están las respuestas a las preguntas más comunes.
        Si necesitas más ayuda, escríbenos.
      </p>

      {/* Highlights */}
      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="border border-white/5 bg-zinc-900/40 p-5">
            <Icon className="mb-3 h-5 w-5 text-red-500" />
            <p className="font-podium text-sm uppercase tracking-wide text-white/80">
              {title}
            </p>
            <p className="mt-1 font-inter text-xs leading-relaxed text-white/35">
              {desc}
            </p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <h2 className="mb-4 mt-14 font-podium text-xl uppercase tracking-wide text-white">
        Preguntas frecuentes
      </h2>
      <div className="divide-y divide-white/5 border-y border-white/5">
        {FAQ.map(({ q, a }) => (
          <details key={q} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-inter text-sm font-medium text-white/80 transition-colors hover:text-white">
              {q}
              <span className="shrink-0 font-podium text-xl text-red-500 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="pb-5 font-inter text-sm leading-relaxed text-white/45">
              {a}
            </p>
          </details>
        ))}
      </div>

      {/* Contact */}
      <div className="mt-14 border border-white/10 bg-zinc-900/40 p-8 text-center">
        <Mail className="mx-auto mb-4 h-8 w-8 text-red-500" />
        <h3 className="font-podium text-xl uppercase tracking-wide text-white">
          ¿Sigues con dudas?
        </h3>
        <p className="mx-auto mt-2 max-w-sm font-inter text-sm leading-relaxed text-white/40">
          Nuestro equipo está para ayudarte. Escríbenos y te respondemos lo antes
          posible.
        </p>
        <a
          href="mailto:gurutechstore0@gmail.com"
          className="mt-6 inline-flex items-center gap-2 bg-red-600 px-6 py-3 font-inter text-[11px] uppercase tracking-widest text-white transition-colors hover:bg-red-700"
        >
          <Mail className="h-4 w-4" />
          gurutechstore0@gmail.com
        </a>
      </div>

      <p className="mt-10 text-center font-inter text-sm text-white/40">
        ¿Listo para jugar?{' '}
        <Link
          href="/games"
          className="font-semibold text-red-500 transition-colors hover:text-red-400"
        >
          Explorar catálogo
        </Link>
      </p>
    </div>
  )
}
