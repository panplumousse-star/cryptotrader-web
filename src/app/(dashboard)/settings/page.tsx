import type { Metadata } from 'next'
import { SettingsContent } from './settings-content'

export const metadata: Metadata = {
  title: 'Paramètres',
  description: 'Gérez les paramètres de votre compte',
}

export default function SettingsPage() {
  return <SettingsContent />
}
