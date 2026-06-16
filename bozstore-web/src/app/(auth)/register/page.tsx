import type { Metadata } from 'next'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Crear cuenta — BosStore',
}

export default async function RegisterPage(props: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await props.searchParams
  return <RegisterForm next={next} />
}
