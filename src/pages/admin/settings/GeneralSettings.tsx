import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    siteName: "",
    currency: "",
    timezone: "",
    maintenanceMode: false,
  });

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">General Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle>Site Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                placeholder="Enter site name"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                placeholder="Enter currency code"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              placeholder="Enter timezone"
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="mt-2"
            />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Take site offline for maintenance</p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Button size="lg" onClick={handleSave}>
        Save Settings
      </Button>
    </div>
  );
};

export default GeneralSettings;
