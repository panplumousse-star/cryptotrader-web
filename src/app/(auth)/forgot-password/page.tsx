import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Mot de passe oublié',
  description: 'Réinitialisez votre mot de passe CryptoTrader',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
