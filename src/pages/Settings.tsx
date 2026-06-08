import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Moon, Sun, Bell, Lock, User, ChevronRight } from "lucide-react";

const Settings = () => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDark, setIsDark] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    betReminders: true,
    oddChanges: true,
    twoFactorEnabled: false,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("light");
  };

  const toggleSetting = async (key: string) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key as keyof typeof settings],
    };
    setSettings(newSettings);

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: user?.id,
            ...newSettings,
          },
          { onConflict: "user_id" }
        );

      if (error) throw error;
      toast({ title: "Settings updated successfully" });
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Failed to update settings",
        variant: "destructive",
      });
      // Revert the change
      setSettings((prev) => ({
        ...prev,
        [key]: !newSettings[key as keyof typeof newSettings],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  if (!loading && !user) {
    return null;
  }

  return (
    <Layout>
      <div className="container space-y-6 py-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Manage your account preferences and notifications
          </p>
        </div>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-secondary"
                />
              )}
              <p className="text-xs text-muted-foreground">
                Your email address cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input
                  id="username"
                  value={profile?.username || ""}
                  disabled
                  className="bg-secondary"
                />
              )}
            </div>

            <Button variant="outline" className="w-full justify-between">
              Change Password
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={() => toggleSetting("emailNotifications")}
                disabled={isLoading}
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified on your device
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={() => toggleSetting("pushNotifications")}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-muted-foreground">
                    Receive promotional offers
                  </p>
                </div>
                <Switch
                  checked={settings.marketingEmails}
                  onCheckedChange={() => toggleSetting("marketingEmails")}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Bet Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Get reminded about upcoming matches
                  </p>
                </div>
                <Switch
                  checked={settings.betReminders}
                  onCheckedChange={() => toggleSetting("betReminders")}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Odds Changes</p>
                  <p className="text-sm text-muted-foreground">
                    Notify when odds change on your selections
                  </p>
                </div>
                <Switch
                  checked={settings.oddChanges}
                  onCheckedChange={() => toggleSetting("oddChanges")}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security
                </p>
              </div>
              <Switch
                checked={settings.twoFactorEnabled}
                onCheckedChange={() => toggleSetting("twoFactorEnabled")}
                disabled={isLoading}
              />
            </div>

            <Button variant="outline" className="w-full justify-between">
              View Login History
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Display
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={toggleTheme}
            >
              <span>{isDark ? "Dark Mode" : "Light Mode"}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
