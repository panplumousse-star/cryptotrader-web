'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ForgotPasswordForm() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <h1 className="text-2xl font-semibold leading-none">Mot de passe oublié</h1>
        <p className="text-muted-foreground text-sm">Entrez votre email pour réinitialiser votre mot de passe</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="email@example.com" autoComplete="email" required />
          </div>
          <Button type="submit" className="w-full">
            Envoyer le lien de réinitialisation
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="text-primary hover:underline">
            Retour à la connexion
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
