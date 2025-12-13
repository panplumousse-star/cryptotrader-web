import Link from 'next/link'
import { Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="flex max-w-2xl flex-col items-center gap-8 text-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Wallet className="text-primary h-16 w-16" />
          <h1 className="text-5xl font-bold">CryptoTrader</h1>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold">
            Plateforme de trading de cryptomonnaies
          </h2>
          <p className="text-muted-foreground text-lg">
            Bot algorithmique, machine learning et gestion de portefeuille.
            Automatisez votre trading et optimisez vos investissements crypto.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="min-w-[160px]">
            <Link href="/login">Se connecter</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-[160px]">
            <Link href="/register">S'inscrire</Link>
          </Button>
        </div>

        {/* Features */}
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <div className="text-primary text-2xl font-bold">🤖</div>
            <h3 className="font-semibold">Bot Algorithmique</h3>
            <p className="text-muted-foreground text-sm">
              Trading automatisé 24/7
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-primary text-2xl font-bold">📊</div>
            <h3 className="font-semibold">Machine Learning</h3>
            <p className="text-muted-foreground text-sm">
              Prédictions basées sur l'IA
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-primary text-2xl font-bold">💼</div>
            <h3 className="font-semibold">Gestion Portfolio</h3>
            <p className="text-muted-foreground text-sm">
              Suivi en temps réel
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
