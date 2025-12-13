'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { apiClient } from '@/lib/api'
import {
  Loader2,
  Shield,
  ShieldCheck,
  ShieldOff,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'

interface TwoFactorDialogProps {
  trigger?: React.ReactNode
}

type Step = 'status' | 'setup' | 'verify' | 'backup-codes' | 'disable'

interface MFAStatus {
  mfa_enabled: boolean
  backup_codes_remaining: number
}

interface SetupData {
  secret: string
  qr_code_base64: string
  otpauth_uri: string
}

export function TwoFactorDialog({ trigger }: TwoFactorDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('status')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Status
  const [mfaStatus, setMfaStatus] = useState<MFAStatus | null>(null)

  // Setup
  const [setupData, setSetupData] = useState<SetupData | null>(null)
  const [verifyCode, setVerifyCode] = useState('')

  // Backup codes
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [copiedCodes, setCopiedCodes] = useState(false)

  // Disable
  const [disableCode, setDisableCode] = useState('')

  const resetState = () => {
    setStep('status')
    setError(null)
    setSetupData(null)
    setVerifyCode('')
    setBackupCodes([])
    setCopiedCodes(false)
    setDisableCode('')
  }

  const fetchStatus = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/mfa/status')
      setMfaStatus(response.data)
    } catch (err) {
      setError('Impossible de récupérer le statut 2FA')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchStatus()
    } else {
      resetState()
    }
  }, [open])

  const handleStartSetup = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.post('/mfa/setup')
      setSetupData(response.data)
      setStep('setup')
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } }
      setError(axiosError.response?.data?.detail || 'Erreur lors de la configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifySetup = async () => {
    if (!setupData || verifyCode.length !== 6) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.post('/mfa/verify-setup', {
        secret: setupData.secret,
        code: verifyCode,
      })
      setBackupCodes(response.data.codes)
      setStep('backup-codes')
      // Refresh status
      await fetchStatus()
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } }
      setError(axiosError.response?.data?.detail || 'Code invalide')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisable = async () => {
    if (disableCode.length !== 6) return

    setIsLoading(true)
    setError(null)
    try {
      await apiClient.post('/mfa/disable', { code: disableCode })
      await fetchStatus()
      setStep('status')
      setDisableCode('')
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } }
      setError(axiosError.response?.data?.detail || 'Code invalide')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerateBackupCodes = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/mfa/backup-codes')
      setBackupCodes(response.data.codes)
      setCopiedCodes(false)
      await fetchStatus()
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } }
      setError(axiosError.response?.data?.detail || 'Erreur lors de la régénération')
    } finally {
      setIsLoading(false)
    }
  }

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'))
    setCopiedCodes(true)
    setTimeout(() => setCopiedCodes(false), 2000)
  }

  const renderStatus = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Authentification à deux facteurs (2FA)
        </DialogTitle>
        <DialogDescription>
          Ajoutez une couche de sécurité supplémentaire à votre compte
        </DialogDescription>
      </DialogHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : mfaStatus ? (
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              {mfaStatus.mfa_enabled ? (
                <ShieldCheck className="h-8 w-8 text-green-500" />
              ) : (
                <ShieldOff className="h-8 w-8 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">
                  {mfaStatus.mfa_enabled ? '2FA activé' : '2FA désactivé'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {mfaStatus.mfa_enabled
                    ? `${mfaStatus.backup_codes_remaining} codes de secours restants`
                    : 'Votre compte n\'est pas protégé par 2FA'}
                </p>
              </div>
            </div>
            <Badge variant={mfaStatus.mfa_enabled ? 'default' : 'secondary'}>
              {mfaStatus.mfa_enabled ? 'Actif' : 'Inactif'}
            </Badge>
          </div>

          {mfaStatus.mfa_enabled && mfaStatus.backup_codes_remaining <= 3 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">
                Il vous reste peu de codes de secours. Pensez à en régénérer.
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      ) : null}

      <DialogFooter className="flex-col sm:flex-row gap-2">
        {mfaStatus?.mfa_enabled ? (
          <>
            <Button
              variant="outline"
              onClick={() => {
                setStep('backup-codes')
                handleRegenerateBackupCodes()
              }}
              disabled={isLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Régénérer les codes
            </Button>
            <Button
              variant="destructive"
              onClick={() => setStep('disable')}
              disabled={isLoading}
            >
              Désactiver 2FA
            </Button>
          </>
        ) : (
          <Button onClick={handleStartSetup} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Shield className="mr-2 h-4 w-4" />
            )}
            Activer 2FA
          </Button>
        )}
      </DialogFooter>
    </>
  )

  const renderSetup = () => (
    <>
      <DialogHeader>
        <DialogTitle>Configuration 2FA</DialogTitle>
        <DialogDescription>
          Scannez ce QR code avec votre application d'authentification (Google Authenticator, Authy, etc.)
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {setupData && (
          <>
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg">
                <img
                  src={`data:image/png;base64,${setupData.qr_code_base64}`}
                  alt="QR Code 2FA"
                  className="w-48 h-48"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Ou entrez ce code manuellement :
              </Label>
              <code className="block p-2 bg-muted rounded text-xs font-mono break-all text-center">
                {setupData.secret}
              </code>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="verify-code">
                Entrez le code à 6 chiffres de votre application
              </Label>
              <Input
                id="verify-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest font-mono"
                autoComplete="one-time-code"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
          </>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => setStep('status')} disabled={isLoading}>
          Retour
        </Button>
        <Button
          onClick={handleVerifySetup}
          disabled={isLoading || verifyCode.length !== 6}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Vérifier et activer
        </Button>
      </DialogFooter>
    </>
  )

  const renderBackupCodes = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-green-600">
          <ShieldCheck className="h-5 w-5" />
          {backupCodes.length > 0 ? 'Codes de secours' : 'Chargement...'}
        </DialogTitle>
        <DialogDescription>
          Conservez ces codes en lieu sûr. Chaque code ne peut être utilisé qu'une seule fois.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
              {backupCodes.map((code, index) => (
                <code key={index} className="text-sm font-mono text-center py-1">
                  {code}
                </code>
              ))}
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs">
                Ces codes ne seront plus affichés. Sauvegardez-les maintenant !
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
          </>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={copyBackupCodes} disabled={isLoading}>
          {copiedCodes ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copié !
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copier les codes
            </>
          )}
        </Button>
        <Button onClick={() => setOpen(false)}>
          Terminé
        </Button>
      </DialogFooter>
    </>
  )

  const renderDisable = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-red-600">
          <ShieldOff className="h-5 w-5" />
          Désactiver 2FA
        </DialogTitle>
        <DialogDescription>
          Entrez votre code 2FA pour confirmer la désactivation.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">
            Attention : La désactivation du 2FA rendra votre compte moins sécurisé.
          </span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="disable-code">Code 2FA</Label>
          <Input
            id="disable-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            value={disableCode}
            onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
            className="text-center text-2xl tracking-widest font-mono"
            autoComplete="one-time-code"
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => setStep('status')} disabled={isLoading}>
          Annuler
        </Button>
        <Button
          variant="destructive"
          onClick={handleDisable}
          disabled={isLoading || disableCode.length !== 6}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Désactiver
        </Button>
      </DialogFooter>
    </>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Configurer 2FA</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {step === 'status' && renderStatus()}
        {step === 'setup' && renderSetup()}
        {step === 'verify' && renderSetup()}
        {step === 'backup-codes' && renderBackupCodes()}
        {step === 'disable' && renderDisable()}
      </DialogContent>
    </Dialog>
  )
}
