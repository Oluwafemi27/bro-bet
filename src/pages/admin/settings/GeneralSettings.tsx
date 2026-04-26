import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    siteName: "NaijaBet",
    currency: "NGN",
    timezone: "Africa/Lagos",
    maintenanceMode: false,
    minStake: 100,
    maxWin: 50000000,
    minDeposit: 100,
    maxDeposit: 10000000,
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
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
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

      <Card>
        <CardHeader>
          <CardTitle>Betting Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minStake">Min Stake (₦)</Label>
              <Input
                id="minStake"
                type="number"
                value={settings.minStake}
                onChange={(e) => setSettings({ ...settings, minStake: Number(e.target.value) })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="maxWin">Max Win (₦)</Label>
              <Input
                id="maxWin"
                type="number"
                value={settings.maxWin}
                onChange={(e) => setSettings({ ...settings, maxWin: Number(e.target.value) })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="minDeposit">Min Deposit (₦)</Label>
              <Input
                id="minDeposit"
                type="number"
                value={settings.minDeposit}
                onChange={(e) => setSettings({ ...settings, minDeposit: Number(e.target.value) })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="maxDeposit">Max Deposit (₦)</Label>
              <Input
                id="maxDeposit"
                type="number"
                value={settings.maxDeposit}
                onChange={(e) => setSettings({ ...settings, maxDeposit: Number(e.target.value) })}
                className="mt-2"
              />
            </div>
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
