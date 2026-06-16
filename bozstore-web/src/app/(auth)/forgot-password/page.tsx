import type { Metadata } from 'next'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Recuperar contraseña — BosStore',
}

export default async function ForgotPasswordPage(props: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await props.searchParams
  return <ForgotPasswordForm defaultEmail={email ?? ''} />
}
