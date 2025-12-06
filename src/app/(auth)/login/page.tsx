import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre compte CryptoTrader pour accéder à vos cryptomonnaies',
}

export default function LoginPage() {
  return <LoginForm />
}
