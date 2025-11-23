/**
 * Settings page for HomeFinder AI SaaS
 */

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Save, LogOut } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { logout } from '@/lib/api/api';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, clearAuth } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Notification preferences
    emailNotifications: true,
    pushNotifications: false,
    // Scraper preferences
    enableRightmove: true,
    enableZoopla: true,
    enableOpenRent: true,
    enableSpareRoom: true,
    // Other preferences
    autoRefresh: true,
    refreshInterval: 30, // minutes
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to save settings
      console.log('[Settings] Saving settings:', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
      console.error('[Settings] Error:', errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    clearAuth();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 bg-muted/30 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold md:text-3xl">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account preferences and notification settings
            </p>
          </div>

          <div className="space-y-6">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={user?.name || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email || ''} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified about new listings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email alerts when new properties are found
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, emailNotifications: checked })
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, pushNotifications: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Scraper Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Scraper Preferences</CardTitle>
                <CardDescription>Enable or disable property sources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Rightmove</Label>
                    <p className="text-sm text-muted-foreground">Search Rightmove properties</p>
                  </div>
                  <Switch
                    checked={settings.enableRightmove}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, enableRightmove: checked })
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Zoopla</Label>
                    <p className="text-sm text-muted-foreground">Search Zoopla properties</p>
                  </div>
                  <Switch
                    checked={settings.enableZoopla}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, enableZoopla: checked })
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>OpenRent</Label>
                    <p className="text-sm text-muted-foreground">Search OpenRent properties</p>
                  </div>
                  <Switch
                    checked={settings.enableOpenRent}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, enableOpenRent: checked })
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SpareRoom</Label>
                    <p className="text-sm text-muted-foreground">Search SpareRoom properties</p>
                  </div>
                  <Switch
                    checked={settings.enableSpareRoom}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, enableSpareRoom: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Auto Refresh */}
            <Card>
              <CardHeader>
                <CardTitle>Auto Refresh</CardTitle>
                <CardDescription>Automatically refresh dashboard data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Auto Refresh</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically check for new listings
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoRefresh}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, autoRefresh: checked })
                    }
                  />
                </div>
                
                {settings.autoRefresh && (
                  <div className="space-y-2">
                    <Label>Refresh Interval (minutes)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={settings.refreshInterval}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          refreshInterval: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button onClick={handleSave} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </div>

            <Separator />

            {/* Logout */}
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;

