'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useSettingsStore } from '@/stores/settingsStore'
import { CheckCircle, XCircle, Loader2, Trash2, Eye, EyeOff, AlertCircle } from 'lucide-react'

export function ApiKeysSettings() {
  const {
    apiKeys,
    apiKeysLoading,
    apiKeysError,
    fetchApiKeys,
    saveApiKeys,
    deleteApiKeys,
    testApiKeys,
  } = useSettingsStore()

  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const handleSave = async () => {
    if (!apiKey || !apiSecret) {
      setTestResult({ success: false, message: 'Veuillez remplir les deux champs' })
      return
    }
    setIsSaving(true)
    setTestResult(null)
    try {
      console.log('Saving API keys...')
      const success = await saveApiKeys(apiKey, apiSecret)
      setIsSaving(false)
      if (success) {
        setApiKey('')
        setApiSecret('')
        setTestResult({ success: true, message: 'Clés API enregistrées avec succès' })
      } else {
        console.error('Save failed:', apiKeysError)
        setTestResult({ success: false, message: apiKeysError || 'Échec de l\'enregistrement' })
      }
    } catch (error) {
      console.error('Save error:', error)
      setIsSaving(false)
      setTestResult({ success: false, message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}` })
    }
  }

  const handleTest = async () => {
    setIsTesting(true)
    setTestResult(null)
    // Test stored keys or provided keys
    const result = apiKey && apiSecret
      ? await testApiKeys(apiKey, apiSecret)
      : await testApiKeys()
    setIsTesting(false)
    setTestResult({
      success: result.success,
      message: result.success
        ? `Connexion réussie! ${result.accountCount} compte(s) trouvé(s)`
        : result.message,
    })
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer vos clés API?')) return
    setIsDeleting(true)
    setTestResult(null)
    const success = await deleteApiKeys()
    setIsDeleting(false)
    if (success) {
      setTestResult({ success: true, message: 'Clés API supprimées' })
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Clés API Coinbase</span>
          {apiKeys?.hasKeys && (
            <Badge variant={apiKeys.isVerified ? 'default' : 'secondary'}>
              {apiKeys.isVerified ? (
                <>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Vérifié
                </>
              ) : (
                <>
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Non v\u00e9rifi\u00e9
                </>
              )}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Configurez vos clés API Coinbase CDP pour le trading automatique
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current status */}
        {apiKeys?.hasKeys && (
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Clé actuelle</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {apiKeys.apiKeyId || '***configuré***'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTest}
                  disabled={isTesting || apiKeysLoading}
                >
                  {isTesting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Tester'
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting || apiKeysLoading}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            {apiKeys.lastVerifiedAt && (
              <p className="text-xs text-muted-foreground">
                Dernière vérification: {formatDate(apiKeys.lastVerifiedAt)}
              </p>
            )}
          </div>
        )}

        {/* Test result */}
        {testResult && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              testResult.success
                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            {testResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <span className="text-sm">{testResult.message}</span>
          </div>
        )}

        <Separator />

        {/* Form for new/update keys */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {apiKeys?.hasKeys
              ? 'Entrez de nouvelles clés pour remplacer les existantes:'
              : 'Entrez vos clés API Coinbase CDP:'}
          </p>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="text"
              placeholder="organizations/.../apiKeys/..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={apiKeysLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-secret">API Secret</Label>
            <div className="relative">
              <Input
                id="api-secret"
                type={showSecret ? 'text' : 'password'}
                placeholder="-----BEGIN EC PRIVATE KEY-----..."
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                disabled={apiKeysLoading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || apiKeysLoading || !apiKey || !apiSecret}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer les clés'
              )}
            </Button>
            {apiKey && apiSecret && (
              <Button
                variant="outline"
                onClick={handleTest}
                disabled={isTesting || apiKeysLoading}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Test...
                  </>
                ) : (
                  'Tester avant d\'enregistrer'
                )}
              </Button>
            )}
          </div>
        </div>

        <Separator />

        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Comment obtenir vos clés API:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>
              Allez sur{' '}
              <a
                href="https://portal.cdp.coinbase.com/access/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Coinbase Developer Platform
              </a>
            </li>
            <li>Créez une nouvelle clé API</li>
            <li>Sélectionnez les permissions nécessaires (Trade, View)</li>
            <li>Copiez l'API Key et l'API Secret ici</li>
          </ol>
          <p className="text-yellow-600 dark:text-yellow-400 mt-2">
            <AlertCircle className="inline h-4 w-4 mr-1" />
            Ne partagez jamais vos clés API avec quiconque.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
