'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ApiKeysSettings, ChangePasswordDialog, PortfolioAssetsSelector, TwoFactorDialog } from '@/components/settings'
import { useSettingsStore } from '@/stores/settingsStore'
import { Loader2 } from 'lucide-react'

export function SettingsContent() {
  const { fetchUserSettings, saveUserSettings, userSettingsLoading, hasLoadedUserSettings } = useSettingsStore()

  useEffect(() => {
    if (!hasLoadedUserSettings && !userSettingsLoading) {
      fetchUserSettings()
    }
  }, [fetchUserSettings, hasLoadedUserSettings, userSettingsLoading])

  const handleSaveSettings = async () => {
    await saveUserSettings()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Paramètres</h2>
        <p className="text-muted-foreground">Gérez les paramètres de votre compte</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informations du profil</CardTitle>
              <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input id="name" placeholder="Votre nom" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@example.com" />
                </div>
              </div>
              <Separator />
              <PortfolioAssetsSelector />
              <Button onClick={handleSaveSettings} disabled={userSettingsLoading}>
                {userSettingsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  'Sauvegarder'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <ApiKeysSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de notification</CardTitle>
              <CardDescription>Choisissez comment vous souhaitez être notifié</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité</CardTitle>
              <CardDescription>Gérez la sécurité de votre compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Authentification à deux facteurs (2FA)</Label>
                <p className="text-muted-foreground text-sm">
                  Activez la 2FA pour sécuriser votre compte
                </p>
                <TwoFactorDialog />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Changer le mot de passe</Label>
                <ChangePasswordDialog />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

