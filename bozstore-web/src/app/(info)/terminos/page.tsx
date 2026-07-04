import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos de uso — BosStore',
  description: 'Términos y condiciones de uso de BosStore.',
}

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: '1. Aceptación de los términos',
    body: [
      'Al acceder y utilizar BosStore aceptas estos términos de uso en su totalidad. Si no estás de acuerdo con alguna parte, te pedimos que no utilices la plataforma.',
    ],
  },
  {
    title: '2. Cuentas de usuario',
    body: [
      'Para realizar compras necesitas crear una cuenta con un correo válido. Eres responsable de mantener la confidencialidad de tu contraseña y de toda la actividad que ocurra bajo tu cuenta.',
      'Debes proporcionar información veraz al registrarte y mantenerla actualizada.',
    ],
  },
  {
    title: '3. Productos digitales',
    body: [
      'Todos los productos vendidos son licencias de software de entrega digital. La compra otorga una licencia de uso personal e intransferible sobre el juego adquirido.',
      'La entrega es instantánea: tras confirmar el pago, el juego queda disponible en tu biblioteca.',
    ],
  },
  {
    title: '4. Pagos',
    body: [
      'Los pagos se procesan de forma segura a través de Stripe. BosStore no almacena los datos de tu tarjeta. Los precios se muestran en dólares estadounidenses (USD) e incluyen los impuestos aplicables.',
    ],
  },
  {
    title: '5. Reembolsos',
    body: [
      'Debido a la naturaleza digital de los productos, los reembolsos se evalúan caso por caso. Contáctanos dentro de las 48 horas posteriores a la compra si el producto presenta un problema.',
    ],
  },
  {
    title: '6. Conducta del usuario',
    body: [
      'Está prohibido revender licencias, manipular precios, o utilizar la plataforma para fines fraudulentos. El incumplimiento puede resultar en la suspensión de la cuenta.',
    ],
  },
  {
    title: '7. Cambios en los términos',
    body: [
      'Podemos actualizar estos términos en cualquier momento. Los cambios entran en vigor al publicarse en esta página.',
    ],
  },
]

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
      <p className="mb-2 font-inter text-[10px] uppercase tracking-[0.25em] text-red-500">
        Legal
      </p>
      <h1 className="font-podium text-4xl uppercase tracking-tight text-white sm:text-5xl">
        Términos de uso
      </h1>
      <p className="mt-3 font-inter text-sm text-white/40">
        Última actualización: junio 2026
      </p>

      <div className="mt-12 space-y-10">
        {SECTIONS.map(({ title, body }) => (
          <section key={title}>
            <h2 className="mb-3 font-podium text-lg uppercase tracking-wide text-white">
              {title}
            </h2>
            <div className="space-y-3">
              {body.map((p, i) => (
                <p key={`${title}-${i}`} className="font-inter text-sm leading-relaxed text-white/50">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
