'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from '@/lib/api/client'
import { AxiosError } from 'axios'

// API error response types
interface ApiErrorDetail {
  detail: string | Record<string, unknown>
}

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mfaRequired, setMfaRequired] = useState(false)
  const [mfaToken, setMfaToken] = useState('')
  const [showMfaInput, setShowMfaInput] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      })

      if (response.data.mfa_required) {
        // MFA is required
        setMfaRequired(true)
        setMfaToken(response.data.mfa_token)
        setShowMfaInput(true)
        setIsLoading(false)
        return
      }

      if (response.data.access_token) {
        // Store token first
        const token = response.data.access_token

        // Fetch user profile from /auth/me
        try {
          const meResponse = await apiClient.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          })

          const user = {
            id: meResponse.data.id,
            email: meResponse.data.email,
            name: meResponse.data.name,
            mfaEnabled: meResponse.data.mfa_enabled || false,
          }

          // Call login to store user and token
          login(user, token)
        } catch {
          // Fallback if /auth/me fails
          const user = {
            id: email,
            email: email,
            name: email,
            mfaEnabled: response.data.mfa_enabled || false,
          }
          login(user, token)
        }

        // Redirect to portfolio
        router.push('/portfolio')
      }
    } catch (err) {
      const error = err as AxiosError<ApiErrorDetail>
      let errorMessage = 'Erreur de connexion'

      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string'
          ? error.response.data.detail
          : 'Email ou mot de passe incorrect'
      } else if (error.response?.status === 401) {
        errorMessage = 'Email ou mot de passe incorrect'
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
      console.error('Login error:', errorMessage, error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await apiClient.post('/auth/login/mfa', {
        mfa_token: mfaToken,
        code: mfaCode,
      })

      if (response.data.access_token) {
        // Store token first
        const token = response.data.access_token

        // Fetch user profile from /auth/me
        try {
          const meResponse = await apiClient.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          })

          const user = {
            id: meResponse.data.id,
            email: meResponse.data.email,
            name: meResponse.data.name,
            mfaEnabled: meResponse.data.mfa_enabled || true,
          }

          // Call login to store user and token
          login(user, token)
        } catch {
          // Fallback if /auth/me fails
          const user = {
            id: email,
            email: email,
            name: email,
            mfaEnabled: true,
          }
          login(user, token)
        }

        // Redirect to portfolio
        router.push('/portfolio')
      }
    } catch (err) {
      const error = err as AxiosError<ApiErrorDetail>
      let errorMessage = 'Code MFA invalide'

      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string'
          ? error.response.data.detail
          : 'Code MFA invalide'
      } else if (error.response?.status === 401) {
        errorMessage = 'Code MFA invalide'
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
      console.error('MFA verification error:', errorMessage, error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <h1 className="text-2xl font-semibold leading-none">
          {showMfaInput ? 'Vérification 2FA' : 'Connexion'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {showMfaInput
            ? 'Entrez le code de votre authenticateur'
            : 'Entrez vos identifiants pour accéder à votre compte'}
        </p>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showMfaInput ? (
          <form onSubmit={handleMfaSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mfa-code">Code d&apos;authentification</Label>
              <Input
                id="mfa-code"
                type="text"
                placeholder="000000"
                maxLength={9}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 9))}
                required
                disabled={isLoading}
                autoFocus
              />
              <p className="text-muted-foreground text-xs">
                Entrez le code à 6 chiffres de votre app d&apos;authentification ou un code de secours à 8-9 chiffres
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || mfaCode.length < 6}>
              {isLoading ? 'Vérification en cours...' : 'Vérifier'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowMfaInput(false)
                setMfaCode('')
                setError('')
              }}
              disabled={isLoading}
            >
              Retour
            </Button>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link href="/forgot-password" className="text-primary text-sm hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Pas encore de compte ?{' '}
              <Link href="/register" className="text-primary hover:underline">
                S&apos;inscrire
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
