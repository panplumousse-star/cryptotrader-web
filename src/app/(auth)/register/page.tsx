import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Inscription',
  description: 'Créez votre compte CryptoTrader et commencez à trader des cryptomonnaies',
}

export default function RegisterPage() {
  return <RegisterForm />
}
