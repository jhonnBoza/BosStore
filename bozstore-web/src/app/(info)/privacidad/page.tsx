import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacidad — BosStore',
  description: 'Política de privacidad de BosStore.',
}

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: 'Datos que recopilamos',
    body: [
      'Recopilamos los datos que nos proporcionas al crear tu cuenta (nombre y correo electrónico) y los necesarios para procesar tus compras. Los datos de pago son gestionados directamente por Stripe; nunca tenemos acceso a tu número de tarjeta.',
    ],
  },
  {
    title: 'Cómo usamos tus datos',
    body: [
      'Usamos tu información para gestionar tu cuenta, procesar pedidos, entregar tus juegos y enviarte comunicaciones relacionadas con tus compras.',
      'No vendemos ni compartimos tus datos personales con terceros para fines publicitarios.',
    ],
  },
  {
    title: 'Autenticación',
    body: [
      'La autenticación se realiza a través de Supabase. Puedes registrarte con correo y contraseña (con verificación por código) o mediante proveedores como Google.',
    ],
  },
  {
    title: 'Cookies',
    body: [
      'Utilizamos cookies estrictamente necesarias para mantener tu sesión iniciada. No utilizamos cookies de seguimiento publicitario.',
    ],
  },
  {
    title: 'Tus derechos',
    body: [
      'Puedes acceder, corregir o eliminar tu información personal en cualquier momento desde tu cuenta o contactándonos. También puedes solicitar la eliminación completa de tu cuenta.',
    ],
  },
  {
    title: 'Seguridad',
    body: [
      'Protegemos tus datos con cifrado en tránsito (SSL) y prácticas de seguridad estándar de la industria. Aun así, ningún sistema es 100% infalible.',
    ],
  },
]

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
      <p className="mb-2 font-inter text-[10px] uppercase tracking-[0.25em] text-red-500">
        Legal
      </p>
      <h1 className="font-podium text-4xl uppercase tracking-tight text-white sm:text-5xl">
        Privacidad
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
