'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <h1 className="text-2xl font-semibold leading-none">Connexion</h1>
        <p className="text-muted-foreground text-sm">Entrez vos identifiants pour accéder à votre compte</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="email@example.com" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <Link href="/forgot-password" className="text-primary text-sm hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            <Input id="password" type="password" autoComplete="current-password" required />
          </div>
          <Button type="submit" className="w-full">
            Se connecter
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-primary hover:underline">
            S&apos;inscrire
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
